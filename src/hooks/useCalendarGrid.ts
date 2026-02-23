import { useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export const useCalendarGrid = (viewMonth: Dayjs) => {
  return useMemo(() => {
    const start = viewMonth.startOf("month").startOf("isoWeek");
    const end = viewMonth.endOf("month").endOf("isoWeek");

    const weeks: Dayjs[][] = [];
    let current = start;

    while (current.isBefore(end) || current.isSame(end, "day")) {
      const week: Dayjs[] = [];

      for (let i = 0; i < 7; i++) {
        week.push(current);
        current = current.add(1, "day");
      }

      weeks.push(week);
    }

    return weeks;
  }, [viewMonth]);
};
