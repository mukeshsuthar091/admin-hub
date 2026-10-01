export enum TransactionDateFilter {
  ALL = 'all',
  LAST_30_DAYS = 'last_30_days',
}

export enum TransactionTypeFilter {
  ALL = 'all',
  PAYMENT = 'payment',
  REFUND = 'refund',
  TRANSFER = 'transfer',
}

export enum TransactionAmountFilter {
  ALL = 'all',
  UNDER_1000 = 'under_1000',
  BETWEEN_1000_AND_10000 = '1000_to_10000',
  OVER_10000 = 'over_10000',
}
