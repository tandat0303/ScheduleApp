import React, { useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { DatePicker, Modal } from "antd";
import type { CalendarEvent } from "../types";
import { sampleEvents } from "../types/sample";

dayjs.extend(isoWeek);

type EventRange = {
  start: Dayjs;
  end: Dayjs;
  events: CalendarEvent[];
};

const MobileCalendar: React.FC = () => {
  const [month, setMonth] = useState(dayjs());
  const [activeRange, setActiveRange] = useState<EventRange | null>(null);

  const days = useMemo(() => {
    const start = month.startOf("month").startOf("week");
    const end = month.endOf("month").endOf("week");

    const result: Dayjs[] = [];
    let d = start.clone();
    while (d.isBefore(end) || d.isSame(end, "day")) {
      result.push(d);
      d = d.add(1, "day");
    }
    return result;
  }, [month]);

  /**
   * GOM EVENT THÀNH RANGE
   */
  const ranges = useMemo<EventRange[]>(() => {
    const sorted = [...sampleEvents].sort(
      (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
    );

    const result: EventRange[] = [];

    sorted.forEach((event) => {
      const s = dayjs(event.startDate);
      const e = dayjs(event.endDate);

      const overlap = result.find(
        (r) => !(e.isBefore(r.start, "day") || s.isAfter(r.end, "day")),
      );

      if (overlap) {
        overlap.start = s.isBefore(overlap.start) ? s : overlap.start;
        overlap.end = e.isAfter(overlap.end) ? e : overlap.end;
        overlap.events.push(event);
      } else {
        result.push({
          start: s,
          end: e,
          events: [event],
        });
      }
    });

    return result;
  }, []);

  const today = dayjs();

  const goToPreviousMonth = () => setMonth(month.subtract(1, "month"));
  const goToNextMonth = () => setMonth(month.add(1, "month"));
  const goToToday = () => setMonth(dayjs());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header với gradient */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-95"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-wide">
              {month.format("MMMM YYYY")}
            </h2>
            <button
              onClick={goToToday}
              className="text-xs mt-1 px-3 py-1 bg-white/20 rounded-full hover:bg-white/30 transition-all"
            >
              Today
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-95"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 py-5">
        {/* Week header */}
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-600 mb-3">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
            <div
              key={d}
              className={`${i === 0 || i === 6 ? "text-red-400" : ""}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="relative bg-white rounded-2xl shadow-xl p-3 overflow-hidden">
          {/* Decorative gradient background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -z-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-100 to-yellow-100 rounded-full blur-3xl opacity-30 -z-10" />

          <div className="grid grid-cols-7 gap-y-7 text-center text-sm relative z-10">
            {days.map((d, index) => {
              const isToday = d.isSame(today, "day");
              const isCurrentMonth = d.month() === month.month();
              const isWeekend = d.day() === 0 || d.day() === 6;

              return (
                <div
                  key={d.format("YYYY-MM-DD")}
                  className={`relative ${
                    isCurrentMonth ? "text-gray-800" : "text-gray-300"
                  }`}
                >
                  <div
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-xl font-medium transition-all
                      ${
                        isToday
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110 font-bold"
                          : isCurrentMonth && isWeekend
                            ? "text-red-400"
                            : ""
                      }
                      ${!isToday && isCurrentMonth ? "hover:bg-gray-100 hover:scale-105" : ""}
                    `}
                  >
                    {d.date()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RANGE BARS - với thiết kế đẹp hơn */}
          {ranges.map((range, idx) => {
            const startIdx = days.findIndex((d) =>
              d.isSame(range.start, "day"),
            );
            const endIdx = days.findIndex((d) => d.isSame(range.end, "day"));
            if (startIdx === -1 || endIdx === -1) return null;

            const rowStart = Math.floor(startIdx / 7);
            const colStart = startIdx % 7;
            // const rowEnd = Math.floor(endIdx / 7);
            // const colEnd = endIdx % 7;

            // Gradient colors cho events
            const gradients = [
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            ];

            return (
              <div
                key={idx}
                className="absolute h-3 rounded-full cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                style={{
                  left: `${(colStart / 7) * 100}%`,
                  width: `${((endIdx - startIdx + 1) / 7) * 100}%`,
                  top: `${rowStart * 56 + 48}px`,
                  background: gradients[idx % gradients.length],
                }}
                onClick={() => setActiveRange(range)}
              />
            );
          })}
        </div>

        {/* Event count indicator */}
        {ranges.length > 0 && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md text-sm">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse" />
              <span className="text-gray-600 font-medium">
                {ranges.length} event range{ranges.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* RANGE EVENTS MODAL */}
      <Modal
        open={!!activeRange}
        onCancel={() => setActiveRange(null)}
        footer={null}
        title={
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Events ({activeRange?.events.length})
            </span>
          </div>
        }
        className="mobile-calendar-modal"
      >
        <div className="space-y-3 mt-4">
          {activeRange?.events.map((e, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 mb-1">
                    {e.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{e.startDate}</span>
                    <span>→</span>
                    <span>{e.endDate}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default MobileCalendar;
