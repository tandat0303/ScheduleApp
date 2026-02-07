import React, { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import type { CalendarEvent } from "../types";
import { sampleEvents } from "../types/sample";
import EventDetailModal from "./EventDetailModal";
import { accentColors, withAlpha } from "../lib/helpers";
import { DatePicker } from "antd";
import { MoonFilled, SunFilled } from "@ant-design/icons";
import { useRef } from "react";
import { CalendarDays, LocateFixed, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { EventSkeleton } from "./ui/EventSkeleton";
import { EmptyState } from "./ui/EmptyState";
import Calendar from "../assets/calendar.png";

dayjs.extend(isBetween);

const MobileCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [now, setNow] = useState(dayjs());

  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dayRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLoadingEvents(true);
    const t = setTimeout(() => setLoadingEvents(false), 300);
    return () => clearTimeout(t);
  }, [selectedDate]);

  const openEventModal = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeEventModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const isPM = now.hour() >= 12;

  const today = dayjs();
  const isTodaySelected = selectedDate.isSame(today, "day");

  const daysInMonth = Array.from(
    { length: selectedDate.daysInMonth() },
    (_, i) => selectedDate.startOf("month").add(i, "day"),
  );

  const selectedDateEvents = sampleEvents.filter((event) => {
    const start = dayjs(event.startDate);
    const end = dayjs(event.endDate);
    const selected = selectedDate.startOf("day");
    return selected.isBetween(start, end, null, "[]");
  });

  const sortedEvents = selectedDateEvents.sort((a, b) => {
    if (!a.startTime || !b.startTime) return 0;
    return a.startTime.localeCompare(b.startTime);
  });

  const scrollToDay = (day: Dayjs) => {
    const key = day.format("YYYY-MM-DD");
    const el = dayRefs.current[key];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="min-h-screen bg-[#EAF7FD] p-4">
      {/* Header */}
      <div className="mb-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <img
              src={Calendar}
              alt="Calendar"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-xl font-bold text-gray-800">
              {selectedDate.format("MMMM D, YYYY")}
            </h1>
          </div>

          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              isPM
                ? "bg-indigo-50 text-indigo-600"
                : "bg-amber-50 text-amber-500"
            }`}
          >
            <span
              className={`inline font-medium ${
                isPM ? "text-indigo-600" : "text-amber-500"
              }`}
            >
              {now.format("hh:mm A")}
            </span>
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
        </div>

        {/* Scrollable Days */}
        <div className="bg-white rounded-lg shadow-sm p-3 border border-[#9EDFEF]">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {daysInMonth.map((day, i) => {
              const isSelected = day.isSame(selectedDate, "day");
              const isToday = day.isSame(today, "day");
              const hasEvent = sampleEvents.some((e) => {
                const start = dayjs(e.startDate).startOf("day");
                const end = dayjs(e.endDate).endOf("day");
                return day.isBetween(start, end, null, "[]");
              });

              return (
                <button
                  ref={(el) => {
                    dayRefs.current[day.format("YYYY-MM-DD")] = el;
                  }}
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative
                    min-w-[64px]
                    flex flex-col items-center py-2 rounded-lg transition-all
                    ${
                      isSelected
                        ? "bg-[#9ae4ec] text-white font-bold shadow-md"
                        : isToday
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "bg-gray-50 text-gray-600"
                    }
                  `}
                >
                  <div className="text-xs font-semibold mb-1">
                    {dayLabels[day.day()]}
                  </div>

                  <div className="text-lg font-bold">{day.date()}</div>

                  {/* Dot indicator */}
                  {hasEvent && (
                    <span
                      className="
                        absolute
                        bottom-1
                        left-1/2
                        -translate-x-1/2
                        w-1.5
                        h-1.5
                        rounded-full
                        bg-[#2ec1fb]
                      "
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Month / Year Picker */}
          <div className="flex justify-center pt-3 border-t border-gray-200">
            <DatePicker
              picker="month"
              value={selectedDate}
              onChange={(date) => {
                if (!date) return;
                setSelectedDate(date.startOf("month"));
              }}
              allowClear={false}
              format="MMMM YYYY"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-between mb-4">
        <div className="flex justify-end gap-2">
          <AnimatePresence>
            {!isTodaySelected && (
              <motion.button
                key="today-btn"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                onClick={() => {
                  setSelectedDate(today);
                  requestAnimationFrame(() => scrollToDay(today));
                }}
                className="
                  w-10 h-10 rounded-full
                  bg-white shadow-md
                  flex items-center justify-center
                  text-[#2ec1fb]
                  hover:bg-[#EAF7FD]
                "
                title="Go to today"
              >
                <LocateFixed size={18} />
              </motion.button>
            )}
          </AnimatePresence>
          {/* Selected day */}
          <button
            onClick={() => scrollToDay(selectedDate)}
            className="
              w-10 h-10 rounded-full
              bg-white shadow-md
              flex items-center justify-center
              text-[#6EC9D4]
              hover:bg-[#EAF7FD]
              transition
            "
            title="Go to selected day"
          >
            <CalendarDays size={18} />
          </button>
        </div>

        <button
          // onClick={() => scrollToDay(selectedDate)}
          className="
            w-10 h-10 rounded-full
            bg-white shadow-md
            flex items-center justify-center
            text-[#00b1c5]
            hover:bg-[#EAF7FD]
            transition
          "
          title="Create Events"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Events List */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          {loadingEvents ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EventSkeleton />
            </motion.div>
          ) : sortedEvents.length > 0 ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {sortedEvents.map((event, index) => {
                const bgColor = withAlpha(accentColors[event.color], 0.15);
                return (
                  <button
                    key={index}
                    onClick={() => openEventModal(event)}
                    className="w-full text-left rounded-lg p-4
                         transition-all active:scale-95 hover:shadow-md"
                    style={{
                      backgroundColor: bgColor,
                      borderLeft: `4px solid ${accentColors[event.color]}`,
                    }}
                  >
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {event.startTime} - {event.endTime}
                    </p>
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <EmptyState key={selectedDate.format("YYYY-MM-DD")} />
          )}
        </AnimatePresence>
      </div>

      {/* Events Footer Message */}
      {/* {sortedEvents.length > 0 && (
        <div className="text-center mt-6 text-xs text-gray-400">
          Reminder: update today
        </div>
      )} */}

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        open={isModalOpen}
        onClose={closeEventModal}
      />
    </div>
  );
};

export default MobileCalendar;
