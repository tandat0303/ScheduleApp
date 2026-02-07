import React, { useState, useMemo, useEffect, useCallback } from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  SearchOutlined,
  BellOutlined,
  LeftOutlined,
  RightOutlined,
  MoonFilled,
  SunFilled,
} from "@ant-design/icons";
import { DatePicker } from "antd";
import type { CalendarEvent, EventBar } from "../types";
import { sampleEvents } from "../types/sample";
import EventDetailModal from "./EventDetailModal";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Calendar from "../assets/calendar.png";
import { accentColors, withAlpha } from "../lib/helpers";
import MobileCalendar from "./MobileCalendar";

dayjs.extend(isoWeek);

// Constants
const ANIMATION_DURATION = 300;
const LOADING_DURATION = 1800;
const TIME_UPDATE_INTERVAL = 60000; // Update every minute instead of every second
const GRID_BACKGROUND_SIZE = "16px 16px";
const EVENT_ROW_HEIGHT = 48;
const EVENT_BASE_HEIGHT = 72;

const CalendarApp: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs("2026-02-01"));
  const [now, setNow] = useState(dayjs());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [direction, setDirection] = useState<"prev" | "next" | null>(null);

  const openEventModal = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const closeEventModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  const isPM = now.hour() >= 12;

  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), TIME_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), LOADING_DURATION);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [loading]);

  useEffect(() => {
    if (!direction) return;
    const t = setTimeout(() => setDirection(null), ANIMATION_DURATION);
    return () => clearTimeout(t);
  }, [direction]);

  const calendarGrid = useMemo(() => {
    const start = selectedDate.startOf("month").startOf("isoWeek");
    const end = selectedDate.endOf("month").endOf("isoWeek");
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
  }, [selectedDate]);

  const eventBars = useMemo(() => {
    const bars: EventBar[] = [];

    calendarGrid.forEach((week, weekIndex) => {
      const rows: { start: Dayjs; end: Dayjs; event: CalendarEvent }[][] = [];

      sampleEvents.forEach((event) => {
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
  }, [calendarGrid]);

  const goToPreviousMonth = useCallback(() => {
    setDirection("prev");
    setSelectedDate((d) => d.subtract(1, "month"));
  }, []);

  const goToNextMonth = useCallback(() => {
    setDirection("next");
    setSelectedDate((d) => d.add(1, "month"));
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(dayjs());
  }, []);

  const getWeekHeight = useCallback(
    (weekIndex: number) => {
      const eventsInWeek = eventBars.filter((b) => b.weekIndex === weekIndex);
      if (eventsInWeek.length === 0) return `${EVENT_BASE_HEIGHT}px`;
      const maxRows = Math.max(...eventsInWeek.map((b) => b.row + 1));
      return `${EVENT_BASE_HEIGHT + maxRows * EVENT_ROW_HEIGHT}px`;
    },
    [eventBars],
  );

  return (
    <div className="relative min-h-screen">
      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#EAF7FD] transition-opacity duration-500">
          <DotLottieReact
            src="/Flight.lottie"
            autoplay
            loop
            // className="translate-y-1"
            style={{ width: 220, height: 220 }}
          />
        </div>
      )}
      <div
        className={`transition-opacity duration-500 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* className="hidden md:block" */}
        <div className="hidden md:block">
          <div className="min-h-screen p-4 bg-[#EAF7FD]">
            <div className="max-w-8xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden border border-[#9ADFFC]">
              <div className="p-4 border-b border-[#9ADFFC] flex justify-between items-center">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <img
                    src={Calendar}
                    alt="Calendar"
                    className="w-8 h-8 object-contain"
                  />
                  <span>Calendar</span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  {/* hidden sm:inline */}
                  <span
                    className={`inline font-medium ${
                      isPM ? "text-indigo-600" : "text-amber-500"
                    }`}
                  >
                    {now.format("D MMM,YYYY - hh:mm A")}
                  </span>

                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      isPM
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-amber-50 text-amber-500"
                    }`}
                  >
                    {isPM ? (
                      <span className="text-lg">
                        <MoonFilled />
                      </span>
                    ) : (
                      <span className="text-lg">
                        <SunFilled />
                      </span>
                    )}
                  </div>
                  <button className="px-3 py-1 text-sm border hover:bg-gray-100 rounded">
                    <SearchOutlined />
                  </button>
                  <button className="px-3 py-1 text-sm border hover:bg-gray-100 rounded">
                    <BellOutlined />
                  </button>
                </div>
              </div>

              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DatePicker
                    picker="month"
                    value={selectedDate}
                    onChange={(date) => {
                      if (!date) return;
                      setSelectedDate(date);
                    }}
                    allowClear={false}
                    format="MMMM YYYY"
                    placeholder="Select month"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-sm border hover:bg-gray-100 rounded"
                  >
                    Today
                  </button>
                  <button
                    onClick={goToPreviousMonth}
                    className="hover:bg-gray-100 transition-all p-1.5 rounded-lg"
                  >
                    <LeftOutlined />
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className=" hover:bg-gray-100 transition-all p-1.5 rounded-lg"
                  >
                    <RightOutlined />
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-x-auto">
                <div className="min-w-[640px]">
                  <div className="grid grid-cols-7 text-center text-sm text-[#064B63] relative z-[1] bg-[#F2FBFF] rounded-md">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <div key={day}>{day}</div>
                      ),
                    )}
                  </div>

                  <div
                    key={selectedDate.format("YYYY-MM")}
                    className={`transition-all duration-300 ease-out ${
                      direction === "next" ? "animate-slide-left" : ""
                    } ${direction === "prev" ? "animate-slide-right" : ""}`}
                  >
                    {calendarGrid.map((week, weekIndex) => (
                      <div
                        key={weekIndex}
                        className="relative mb-4 overflow-visible"
                        style={{ height: getWeekHeight(weekIndex) }}
                      >
                        <div className="grid grid-cols-7 text-center text-sm text-gray-500 relative z-[1]">
                          {week.map((date, i) => {
                            const isToday = date.isSame(now, "day");
                            const isCurrentMonth =
                              date.month() === selectedDate.month();

                            return (
                              <div
                                key={i}
                                className={`h-[72px] px-2 pt-1 text-right text-sm ${
                                  isCurrentMonth
                                    ? "text-gray-700"
                                    : "text-gray-400"
                                } ${isToday ? "text-blue-800 font-semibold" : ""}`}
                              >
                                {date.date()}
                              </div>
                            );
                          })}
                        </div>

                        <div className="absolute inset-0 z-[2]">
                          <div
                            className="absolute inset-0 z-[1] pointer-events-none"
                            style={{
                              backgroundImage:
                                "radial-gradient(circle, rgba(46,193,251,0.35) 1px, transparent 1px)",
                              backgroundSize: GRID_BACKGROUND_SIZE,
                            }}
                          />

                          {eventBars
                            .filter((b) => b.weekIndex === weekIndex)
                            .map((bar) => (
                              <div
                                key={`${bar.event.id}-${bar.weekIndex}-${bar.row}`}
                                className="absolute z-[3] rounded-xl shadow-sm cursor-pointer transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] flex items-center overflow-hidden"
                                style={{
                                  left: `calc(${(bar.startCol / 7) * 100}% + ${bar.startCol * 4}px)`,
                                  width: `calc(${(bar.span / 7) * 100}% - ${(7 - bar.span) * 4}px)`,
                                  top: `${48 + bar.row * 44}px`,
                                  minHeight: "36px",
                                  backgroundColor: withAlpha(
                                    accentColors[bar.event.color],
                                    0.12,
                                  ),
                                }}
                                onClick={() => openEventModal(bar.event)}
                              >
                                <div
                                  className="h-full w-[6px]"
                                  style={{
                                    backgroundColor:
                                      accentColors[bar.event.color],
                                  }}
                                />
                                <div className="px-2 py-1 overflow-hidden">
                                  <div className="text-sm font-semibold text-gray-800 leading-snug break-words line-clamp-2">
                                    {bar.event.title}
                                  </div>

                                  {bar.event.startTime && bar.event.endTime && (
                                    <div className="text-xs text-gray-500 line-clamp-1">
                                      {bar.event.startTime} -{" "}
                                      {bar.event.endTime}
                                    </div>
                                  )}

                                  {bar.event.startDate && bar.event.endDate && (
                                    <div className="text-xs text-gray-500 line-clamp-1">
                                      {bar.event.startDate} -{" "}
                                      {bar.event.endDate}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <EventDetailModal
              event={selectedEvent}
              open={isModalOpen}
              onClose={closeEventModal}
            />
          </div>
        </div>

        <div className="block md:hidden">
          <MobileCalendar />
        </div>
      </div>
    </div>
  );
};

export default CalendarApp;
