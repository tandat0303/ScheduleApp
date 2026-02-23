import { useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { CalendarEvent, EventBar } from "../types";

export const useEventBars = (
  calendarGrid: Dayjs[][],
  events: CalendarEvent[],
) => {
  return useMemo(() => {
    const bars: EventBar[] = [];

    calendarGrid.forEach((week, weekIndex) => {
      const rows: { start: Dayjs; end: Dayjs; event: CalendarEvent }[][] = [];

      events.forEach((event) => {
        const start = dayjs(event.startDate).startOf("day");
        const end = dayjs(event.endDate).startOf("day");
        const weekStart = week[0];
        const weekEnd = week[6];

        if (end.isBefore(weekStart) || start.isAfter(weekEnd)) return;

        const displayStart = start.isBefore(weekStart) ? weekStart : start;
        const displayEnd = end.isAfter(weekEnd) ? weekEnd : end;

        let rowIndex = 0;
        while (
          rows[rowIndex]?.some(
            (e) =>
              !(
                displayEnd.isBefore(e.start, "day") ||
                displayStart.isAfter(e.end, "day")
              ),
          )
        ) {
          rowIndex++;
        }

        if (!rows[rowIndex]) rows[rowIndex] = [];
        rows[rowIndex].push({ start: displayStart, end: displayEnd, event });
      });

      rows.forEach((rowEvents, rowIndex) => {
        rowEvents.forEach(({ event, start, end }) => {
          bars.push({
            event,
            startCol: start.diff(week[0], "day"),
            span: end.diff(start, "day") + 1,
            row: rowIndex,
            weekIndex,
          });
        });
      });
    });

    return bars;
  }, [calendarGrid, events]);
};
