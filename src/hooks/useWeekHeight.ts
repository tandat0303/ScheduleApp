import { useCallback } from "react";
import type { EventBar } from "../types";
import { EVENT_BASE_HEIGHT, EVENT_ROW_HEIGHT } from "../lib/constant";

export const useWeekHeight = (eventBars: EventBar[]) => {
  return useCallback(
    (weekIndex: number) => {
      const eventsInWeek = eventBars.filter((b) => b.weekIndex === weekIndex);

      if (eventsInWeek.length === 0) return `${EVENT_BASE_HEIGHT}px`;

      const maxRows = Math.max(...eventsInWeek.map((b) => b.row + 1));

      return `${EVENT_BASE_HEIGHT + maxRows * EVENT_ROW_HEIGHT}px`;
    },
    [eventBars],
  );
};
