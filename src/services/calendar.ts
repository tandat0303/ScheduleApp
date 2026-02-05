import type { CalendarEvent } from "../types";

export const getEvents = async (
  year: number,
  month: number,
): Promise<CalendarEvent[]> => {
  const response = await fetch(`/api/events?year=${year}&month=${month}`);
  return response.json();
};
