import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './repositories/dashboard.repository';
import {
  DashboardChartsDto,
  DashboardStatsDto,
} from './dto/dashboard-response.dto';
import { DashboardInterval, DashboardRange } from './type/dashboard.enum';

@Injectable()
export class DashboardService {
  constructor(private readonly repository: DashboardRepository) { }

  async getStats(): Promise<DashboardStatsDto> {
    const rows = await this.repository.getStats(
      process.env.APP_TIMEZONE || 'UTC',
    );

    const result: DashboardStatsDto = {
      totalUsers: { value: 0, changePercent: 0 },
      totalRevenue: { value: 0, changePercent: 0 },
      activeBookings: { value: 0, changePercent: 0 },
      pendingTransactions: { value: 0, changePercent: 0 },
    };

    for (const row of rows) {
      const current = Number(row.current);
      const previous = Number(row.previous);
      result[row.metric] = {
        value: Number(Number(row.value).toFixed(2)),
        changePercent:
          previous === 0
            ? current === 0
              ? 0
              : current > 0
                ? 100
                : -100
            : Number(
              (((current - previous) / Math.abs(previous)) * 100).toFixed(1),
            ),
      };
    }
    return result;
  }

  async getCharts(range: DashboardRange): Promise<DashboardChartsDto> {
    const timezone = process.env.APP_TIMEZONE || 'UTC';
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    
    const part = (type: string): number =>
      Number(parts.find((item) => item.type === type)!.value);
    
    // UTC dates here represent calendar labels, not payment timestamps.
    const today = new Date(
      Date.UTC(part('year'), part('month') - 1, part('day')),
    );
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth();
    
    let from: Date;
    let to: Date;
    let interval: DashboardInterval;
    
    if (range === DashboardRange.SEVEN_DAYS) {
      from = new Date(today);
      from.setUTCDate(from.getUTCDate() - 6);
      to = today;
      interval = DashboardInterval.DAY;
    } else {
      const months =
        range === DashboardRange.ONE_MONTH
          ? 1
          : range === DashboardRange.THREE_MONTHS
            ? 3
            : range === DashboardRange.SIX_MONTHS
              ? 6
              : 12;
      from = new Date(Date.UTC(year, month - months + 1, 1));
      to = new Date(Date.UTC(year, month + 1, 0));
      interval =
        range === DashboardRange.ONE_MONTH
          ? DashboardInterval.WEEK
          : DashboardInterval.MONTH;
    }
    const fromDate = from.toISOString().slice(0, 10);
    const toDate = to.toISOString().slice(0, 10);
    
    const rows = await this.repository.getRevenue(
      fromDate,
      toDate,
      interval,
      timezone,
    );
    
    const labelFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      ...(interval === DashboardInterval.DAY
        ? { weekday: 'short' }
        : { month: 'short' }),
    });
    return {
      range,
      from: fromDate,
      to: toDate,
      interval,
      series: rows.map((row, index) => ({
        label:
          interval === DashboardInterval.WEEK
            ? `W${index + 1}`
            : labelFormatter.format(new Date(`${row.date}T00:00:00Z`)),
        date: row.date,
        revenue: Number(Number(row.revenue).toFixed(2)),
      })),
    };
  }
}
