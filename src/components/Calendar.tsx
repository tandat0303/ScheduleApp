import React, { useState, useMemo, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  SearchOutlined,
  BellOutlined,
  LeftOutlined,
  RightOutlined,
  CalendarFilled,
  MoonFilled,
  SunFilled,
} from "@ant-design/icons";
import { Select } from "antd";
import type { CalendarEvent, EventBar } from "../types";
import { sampleEvents } from "../types/sample";
import EventDetailModal from "./EventDetailModal";

dayjs.extend(isoWeek);

const CalendarApp: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs("2026-02-01"));

  const [now, setNow] = useState(dayjs());

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openEventModal = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeEventModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const isPM = now.hour() >= 12;

  const months = dayjs.months();
  const years = Array.from({ length: 21 }, (_, i) => dayjs().year() - 10 + i);

  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  const calendarGrid = useMemo(() => {
    const start = selectedDate.startOf("month").startOf("isoWeek");
    const end = selectedDate.endOf("month").endOf("isoWeek");
    const weeks: Dayjs[][] = [];
    let current = start;
    let week: Dayjs[] = [];

    while (current.isBefore(end) || current.isSame(end, "day")) {
      week.push(current);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      current = current.add(1, "day");
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

  const goToPreviousMonth = () =>
    setSelectedDate(selectedDate.subtract(1, "month"));
  const goToNextMonth = () => setSelectedDate(selectedDate.add(1, "month"));
  const goToToday = () => setSelectedDate(dayjs());

  const colorClasses = {
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
    gray: "bg-gray-100 text-gray-500 border-gray-200",
  };

  const today = dayjs();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <CalendarFilled /> Calendar
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            {/* hidden sm:inline */}
            <span
              className={`inline font-medium ${
                isPM ? "text-indigo-600" : "text-amber-500"
              }`}
            >
              {now.format("hh:mm A")}
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
          <div className="flex gap-2">
            <Select
              value={selectedDate.month()}
              onChange={(m) => setSelectedDate(selectedDate.month(m))}
              options={months.map((m, i) => ({ label: m, value: i }))}
            />
            <Select
              value={selectedDate.year()}
              onChange={(y) => setSelectedDate(selectedDate.year(y))}
              options={years.map((y) => ({ label: y, value: y }))}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm border hover:bg-gray-100 rounded"
            >
              Today
            </button>
            <button onClick={goToPreviousMonth}>
              <LeftOutlined />
            </button>
            <button onClick={goToNextMonth}>
              <RightOutlined />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-7 mb-2 text-center text-sm text-gray-500">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {calendarGrid.map((week, weekIndex) => (
              <div key={weekIndex} className="relative mb-2">
                <div className="grid grid-cols-7 gap-2">
                  {/* {week.map((date, i) => (
                    <div
                      key={i}
                      className="min-h-[100px] border rounded p-2 text-right text-sm"
                    >
                      {date.date()}
                    </div>
                  ))} */}
                  {week.map((date, i) => {
                    const isToday = date.isSame(today, "day");
                    const isCurrentMonth =
                      date.month() === selectedDate.month();

                    return (
                      <div
                        key={i}
                        className={`
                          min-h-[100px] border rounded p-2 text-right text-sm relative transition-all
                          ${isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"}
                          ${isToday ? "ring-2 ring-blue-500 bg-blue-50" : ""}
                        `}
                      >
                        <div
                          className={`font-medium ${
                            isToday ? "text-blue-600" : ""
                          }`}
                        >
                          {date.date()}
                        </div>

                        {isToday && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="absolute inset-0 pointer-events-none">
                  {eventBars
                    .filter((b) => b.weekIndex === weekIndex)
                    .map((bar, i) => (
                      <div
                        key={i}
                        className={`
                          absolute pointer-events-auto
                          ${colorClasses[bar.event.color]}
                          cursor-pointer border rounded-md
                          px-2 py-1 text-xs font-medium
                          overflow-hidden backdrop-blur-[1px]

                          transition-all duration-200 ease-out
                          hover:-translate-y-0.5 hover:shadow-lg hover:brightness-105
                          active:scale-95
                        `}
                        style={{
                          left: `calc(${(bar.startCol / 7) * 100}% + ${bar.startCol * 4}px)`,
                          width: `calc(${(bar.span / 7) * 100}% - ${(7 - bar.span) * 4}px)`,
                          top: `${30 + bar.row * 28}px`,
                          height: "24px",
                        }}
                        onClick={() => openEventModal(bar.event)}
                      >
                        {bar.event.title}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EventDetailModal
        event={selectedEvent}
        open={isModalOpen}
        onClose={closeEventModal}
      />
    </div>
  );
};

export default CalendarApp;
