import { Dayjs } from "dayjs";
export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  color: "orange" | "cyan" | "green" | "red";
}

export interface EventBar {
  event: CalendarEvent;
  startCol: number;
  span: number;
  row: number;
  weekIndex: number;
}

export interface EventDetailProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
}

export interface EventRange {
  start: Dayjs;
  end: Dayjs;
  events: CalendarEvent[];
}
