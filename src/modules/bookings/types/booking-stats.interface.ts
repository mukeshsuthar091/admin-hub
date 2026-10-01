export interface BookingCounts {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
}

export interface BookingStatsCounts {
  overall: BookingCounts;
  currentMonth: BookingCounts;
  previousMonth: BookingCounts;
}
