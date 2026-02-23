import React, { useState, useEffect, useRef, useCallback } from "react";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/zh-tw";
import { DatePicker, Drawer, Form, Select, Input, Button } from "antd";
import { MoonFilled, SunFilled } from "@ant-design/icons";
import zhTW from "antd/locale/zh_TW";
import { SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import type { CalendarEvent } from "../types";
import EventDetailModal from "./EventDetailModal";
import { EventSkeleton } from "./ui/EventSkeleton";
import { EmptyState } from "./ui/EmptyState";

import { notify } from "./ui/Notification";
import { leaveAPI } from "../services/leave.api";
import { mapLeaveToEvent } from "../lib/helpers";

import { ANIMATION_DURATION, TIME_UPDATE_INTERVAL } from "../lib/constant";
import CalendarNavigation from "./CalendarNavigation";
import SelectTag from "./ui/SelectTag";
import { useLeaveFilter } from "../hooks/useLeaveFilter";

dayjs.extend(isBetween);
dayjs.locale("zh-tw");

const MobileCalendar: React.FC = () => {
  const [form] = Form.useForm();

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [viewMonth, setViewMonth] = useState<Dayjs>(dayjs());

  const [draftMonth, setDraftMonth] = useState<Dayjs>(dayjs());

  const [now, setNow] = useState(dayjs());
  const [direction, setDirection] = useState<"prev" | "next" | null>(null);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventLoading, setEventLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);

  const {
    businessGroupOptions,
    factoryOptions,
    departmentOptions,
    searchParams,
    setSearchParams,
    handleMultiChange,
    handleSearch,
  } = useLeaveFilter(form);

  const selectedFactories = Form.useWatch("factory", form) || [];
  const selectedDepartments = Form.useWatch("department", form) || [];

  const dayRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const setDayRef = useCallback(
    (key: string) => (el: HTMLButtonElement | null) => {
      dayRefs.current[key] = el;
    },
    [],
  );

  const isPM = now.hour() >= 12;

  useEffect(() => {
    const t = setInterval(() => setNow(dayjs()), TIME_UPDATE_INTERVAL);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!direction) return;
    const t = setTimeout(() => setDirection(null), ANIMATION_DURATION);
    return () => clearTimeout(t);
  }, [direction]);

  useEffect(() => {
    setTimeout(() => {
      const todayKey = dayjs().format("YYYY-MM-DD");
      const el = dayRefs.current[todayKey];

      el?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }, 100);
  }, []);

  useEffect(() => {
    if (!searchParams || !searchParams.business_group) {
      return;
    }

    const loadEvents = async () => {
      try {
        setEventLoading(true);

        const data = await leaveAPI.getLeavesHistory(searchParams);

        setEvents(data.map((item, index) => mapLeaveToEvent(item, index)));
      } catch (err) {
        notify("error", "Error", "Load leave history failed", 1.5);
        setEvents([]);
      } finally {
        setEventLoading(false);
      }
    };

    loadEvents();
  }, [searchParams]);

  const goToPreviousMonth = useCallback(() => {
    setDirection("prev");
    setViewMonth((d) => d.subtract(1, "month"));
  }, []);

  const goToNextMonth = useCallback(() => {
    setDirection("next");
    setViewMonth((d) => d.add(1, "month"));
  }, []);

  const goToToday = useCallback(() => {
    const currentMonth = dayjs();

    setViewMonth(currentMonth);
    setDraftMonth(currentMonth);
    setSelectedDate(currentMonth);

    setTimeout(() => {
      const todayKey = dayjs().format("YYYY-MM-DD");
      const el = dayRefs.current[todayKey];

      el?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }, 100);

    setSearchParams((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        date: currentMonth.format("YYYY-MM"),
      };
    });
  }, []);

  const openEventModal = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const closeEventModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  const daysInMonth = Array.from({ length: viewMonth.daysInMonth() }, (_, i) =>
    viewMonth.startOf("month").add(i, "day"),
  );

  const selectedDateEvents = events.filter((event) => {
    const start = dayjs(event.startDate);
    const end = dayjs(event.endDate);
    return selectedDate.startOf("day").isBetween(start, end, null, "[]");
  });

  const sortedEvents = [...selectedDateEvents].sort((a, b) => {
    const startA = dayjs(a.startDate);
    const startB = dayjs(b.startDate);

    if (!startA.isSame(startB, "day")) {
      return startA.isBefore(startB) ? -1 : 1;
    }

    const endA = dayjs(a.endDate);
    const endB = dayjs(b.endDate);

    if (!endA.isSame(endB, "day")) {
      return endA.isBefore(endB) ? -1 : 1;
    }

    return a.title.localeCompare(b.title);
  });

  const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="min-h-screen bg-[#EAF7FD] p-4">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <div
            className={`px-2 py-1 rounded-full flex items-center gap-1 ${
              isPM
                ? "bg-indigo-50 text-indigo-600"
                : "bg-amber-50 text-amber-500"
            }`}
          >
            {isPM ? <MoonFilled /> : <SunFilled />}
            {now.format("hh:mm:ss A")}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterOpen(true)}
            className="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center"
            aria-label="Open filters"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* NAVIGATION BUTTONS */}
      <div className="mb-4 flex items-center justify-between bg-white rounded-lg p-3 border">
        <span className="font-bold">{viewMonth.format("MMMM, YYYY")}</span>

        <div className="flex items-center gap-2">
          <CalendarNavigation
            goToToday={goToToday}
            goToPreviousMonth={goToPreviousMonth}
            goToNextMonth={goToNextMonth}
          />
        </div>
      </div>

      {/* DAYS CAROUSEL */}
      <div className="bg-white rounded-lg p-3 border mb-4">
        <div
          key={selectedDate.format("YYYY-MM")}
          className={`flex gap-2 overflow-x-auto no-scrollbar transition-all duration-300 ease-out ${
            direction === "next" ? "animate-slide-left" : ""
          } ${direction === "prev" ? "animate-slide-right" : ""}`}
        >
          {daysInMonth.map((day) => {
            const isSelected = day.isSame(selectedDate, "day");
            const isToday = day.isSame(now, "day");
            const hasEvent = events.some((e) =>
              day.isBetween(dayjs(e.startDate), dayjs(e.endDate), null, "[]"),
            );

            return (
              <button
                key={day.format("DD")}
                ref={setDayRef(day.format("YYYY-MM-DD"))}
                onClick={() => setSelectedDate(day)}
                className={`min-w-[64px] py-2 rounded-lg transition-all ${
                  isSelected
                    ? "bg-[#9ae4ec] text-white"
                    : isToday
                      ? "bg-blue-50 border-2 border-blue-500"
                      : "bg-gray-50"
                }`}
              >
                <div className="text-xs">{dayLabels[day.day()]}</div>
                <div
                  className={`font-bold ${isToday && !isSelected ? "text-blue-600" : ""}`}
                >
                  {day.date()}
                </div>
                {hasEvent && (
                  <span
                    className={`block w-1.5 h-1.5 mx-auto mt-1 rounded-full ${
                      isSelected ? "bg-white" : "bg-blue-400"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* EVENTS */}
      <div className="flex-1 overflow-hidden mb-3">
        <div
          className="overflow-y-auto no-scrollbar pr-1"
          style={{ maxHeight: "calc(100vh - 320px)" }}
        >
          <AnimatePresence mode="wait">
            {eventLoading ? (
              <EventSkeleton key="skeleton" />
            ) : sortedEvents.length ? (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 pb-4"
              >
                {sortedEvents.map((event, i) => (
                  <motion.button
                    key={i}
                    onClick={() => openEventModal(event)}
                    className="w-full p-4 rounded-lg text-left transition-all active:scale-95"
                    style={{
                      backgroundColor: event.color,
                      borderLeft: `4px solid ${event.color}`,
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="font-semibold">
                      {event.facName} - {event.title} ({event.leaveSummary})
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <EmptyState key="empty" />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FILTER DRAWER */}
      <Drawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        placement="bottom"
        size="auto"
        title="篩選資料"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            handleSearch(values, draftMonth);

            setViewMonth(draftMonth);
            setSelectedDate(draftMonth.startOf("month"));

            setTimeout(() => {
              setFilterOpen(false);
            }, 600);

            setTimeout(() => {
              const firstDayKey = draftMonth
                .startOf("month")
                .format("YYYY-MM-DD");
              const el = dayRefs.current[firstDayKey];

              el?.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
              });
            }, 800);
          }}
        >
          {/* Business Group */}
          <Form.Item label="事業群" name="business_group">
            <Select options={businessGroupOptions} placeholder="選擇事業群" />
          </Form.Item>

          {/* Factory */}
          <Form.Item label="廠別" name="factory">
            <Select
              mode="multiple"
              options={factoryOptions}
              placeholder="選擇廠別"
              allowClear
              onChange={(values) =>
                handleMultiChange("factory", values, factoryOptions)
              }
              tagRender={(props) => (
                <SelectTag
                  {...props}
                  selectedCount={selectedFactories?.length}
                />
              )}
            />
          </Form.Item>

          {/* Department */}
          <Form.Item label="部門" name="department">
            <Select
              mode="multiple"
              options={departmentOptions}
              placeholder="選擇部門"
              allowClear
              onChange={(values) =>
                handleMultiChange("department", values, factoryOptions)
              }
              tagRender={(props) => (
                <SelectTag
                  {...props}
                  selectedCount={selectedDepartments?.length}
                />
              )}
            />
          </Form.Item>

          {/* Name */}
          <Form.Item label="姓名" name="name">
            <Input placeholder="輸入姓名" allowClear />
          </Form.Item>

          {/* Leave Date - Month Picker */}
          <Form.Item label="休假日期">
            <DatePicker
              picker="month"
              locale={zhTW.DatePicker}
              value={draftMonth}
              onChange={(date) => {
                if (!date) return;
                setDraftMonth(date);
              }}
              allowClear
              format="MMMM YYYY"
              placeholder="選擇月份"
              className="w-full"
            />
          </Form.Item>

          {/* Submit Button */}
          <Button
            htmlType="submit"
            type="primary"
            block
            className="bg-[#1e64ee]"
          >
            查詢
          </Button>
        </Form>
      </Drawer>

      {/* EVENT MODAL */}
      <EventDetailModal
        event={selectedEvent}
        open={isModalOpen}
        onClose={closeEventModal}
      />
    </div>
  );
};

export default MobileCalendar;
