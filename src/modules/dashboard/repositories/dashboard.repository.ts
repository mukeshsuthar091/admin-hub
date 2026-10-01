import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DashboardInterval } from '../type/dashboard.enum';

export interface DashboardMetricRow {
  metric:
    'totalUsers' | 'totalRevenue' | 'activeBookings' | 'pendingTransactions';
  value: string;
  current: string;
  previous: string;
}

export interface DashboardRevenueRow {
  date: string;
  revenue: string;
}

// Refunded originals remain gross payments; separate refunds subtract once.
const revenueAmount = `CASE
  WHEN transaction_type = 'payment' AND status IN ('completed', 'refunded') THEN total_amount
  WHEN transaction_type = 'refund' AND status IN ('completed', 'refunded') THEN -ABS(total_amount)
  ELSE 0 END`;

@Injectable()
export class DashboardRepository {
  constructor(private readonly dataSource: DataSource) {}

  getStats(timezone: string): Promise<DashboardMetricRow[]> {
    return this.dataSource.query<DashboardMetricRow[]>(
      `
      WITH boundaries AS (
        SELECT DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE $1) AS month_start
      ), events AS (
        SELECT 'totalUsers' AS metric, 1::numeric AS amount, "createdAt" AS event_at
        FROM users WHERE is_delete = false
        UNION ALL
        SELECT 'activeBookings', 1, "createdAt" FROM bookings
        WHERE is_delete = false AND status IN ('pending', 'confirmed')
        UNION ALL
        SELECT 'pendingTransactions', 1, "createdAt" FROM transactions
        WHERE is_delete = false AND status = 'pending'
        UNION ALL
        SELECT 'totalRevenue', ${revenueAmount}, COALESCE(proceed_at, "createdAt")
        FROM transactions WHERE is_delete = false
      )
      SELECT metric, SUM(amount) AS value,
        COALESCE(SUM(amount) FILTER (WHERE event_at >= (month_start AT TIME ZONE $1)
          AND event_at < ((month_start + INTERVAL '1 month') AT TIME ZONE $1)), 0) AS current,
        COALESCE(SUM(amount) FILTER (WHERE event_at >= ((month_start - INTERVAL '1 month') AT TIME ZONE $1)
          AND event_at < (month_start AT TIME ZONE $1)), 0) AS previous
      FROM events CROSS JOIN boundaries GROUP BY metric
    `,
      [timezone],
    );
  }

  getRevenue(
    from: string,
    to: string,
    interval: DashboardInterval,
    timezone: string,
  ): Promise<DashboardRevenueRow[]> {
    const step =
      interval === DashboardInterval.DAY
        ? '1 day'
        : interval === DashboardInterval.WEEK
          ? '1 week'
          : '1 month';
    const localDate = `(COALESCE(proceed_at, "createdAt") AT TIME ZONE $4)::date`;
    const bucket =
      interval === DashboardInterval.MONTH
        ? `DATE_TRUNC('month', ${localDate})::date`
        : interval === DashboardInterval.WEEK
          ? `($1::date + ((${localDate} - $1::date) / 7) * 7)`
          : localDate;
    return this.dataSource.query<DashboardRevenueRow[]>(
      `
      WITH periods AS (
        SELECT GENERATE_SERIES($1::date::timestamp, $2::date::timestamp, $3::interval)::date AS date
      ), totals AS (
        SELECT ${bucket} AS date, SUM(${revenueAmount}) AS revenue
        FROM transactions
        WHERE is_delete = false
          AND COALESCE(proceed_at, "createdAt") >= ($1::date::timestamp AT TIME ZONE $4)
          AND COALESCE(proceed_at, "createdAt") < (($2::date + 1)::timestamp AT TIME ZONE $4)
        GROUP BY 1
      )
      SELECT TO_CHAR(periods.date, 'YYYY-MM-DD') AS date, COALESCE(totals.revenue, 0) AS revenue
      FROM periods LEFT JOIN totals USING (date) ORDER BY periods.date
    `,
      [from, to, step, timezone],
    );
  }
}
