import type { CalendarEvent } from "../types";
import dayjs from "dayjs";

export const EventPopover: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  return (
    <div className="max-w-[260px] text-sm">
      <div className="font-semibold text-gray-800 mb-1">{event.title}</div>

      {event.startDate && event.endDate && (
        <div className="text-gray-600 mb-1">
          {dayjs(event.startDate).isSame(dayjs(event.endDate))
            ? event.startDate
            : `${event.startDate} → ${event.endDate}`}
        </div>
      )}

      {event.startTime && event.endTime && (
        <div className="text-gray-600 mb-1">
          {event.startTime} - {event.endTime}
        </div>
      )}

      {event.description && (
        <div className="text-gray-500 text-xs mt-2 leading-relaxed">
          {event.description}
        </div>
      )}
    </div>
  );
};
