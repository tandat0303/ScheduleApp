import React, { useState, useEffect, useRef } from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/zh-tw";
import { MoonFilled, SunFilled, ArrowUpOutlined } from "@ant-design/icons";
import {
  DatePicker,
  Select,
  Input,
  Button,
  Space,
  Form,
  Popover,
  FloatButton,
} from "antd";
import zhTW from "antd/locale/zh_TW";
import type { CalendarEvent } from "../types";
import { mapLeaveToEvent } from "../lib/helpers";
import MobileCalendar from "./MobileCalendar";
import { EventPopover } from "./EventPopover";
import { leaveAPI } from "../services/leave.api";
import { SearchLoadingOverlay } from "./ui/SearchLoadingOverlay";
import {
  ANIMATION_DURATION,
  GRID_BACKGROUND_SIZE,
  LOADING_DURATION,
  MIN_SEARCH_LOADING,
  TIME_UPDATE_INTERVAL,
} from "../lib/constant";
import AppLoading from "./ui/AppLoading";
import Header from "./Header";
import CalendarNavigation from "./CalendarNavigation";
import { useCalendarGrid } from "../hooks/useCalendarGrid";
import { useEventBars } from "../hooks/useEventBars";
import { useWeekHeight } from "../hooks/useWeekHeight";
import SelectTag from "./ui/SelectTag";
import { useLeaveFilter } from "../hooks/useLeaveFilter";
import { notify } from "./ui/Notification";

dayjs.extend(isoWeek);
dayjs.locale("zh-tw");

const CalendarApp: React.FC = () => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isVisibilityScroll, setIsVisibilityScroll] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [viewMonth, setViewMonth] = useState<Dayjs>(dayjs());

  const [draftMonth, setDraftMonth] = useState<Dayjs>(dayjs());

  const [now, setNow] = useState(dayjs());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventLoading, setEventLoading] = useState(false);

  const [direction, setDirection] = useState<"prev" | "next" | null>(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const [form] = Form.useForm();

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

  const isPM = now.hour() >= 12;

  const calendarGrid = useCalendarGrid(viewMonth);
  const eventBars = useEventBars(calendarGrid, events);
  const getWeekHeight = useWeekHeight(eventBars);

  useEffect(() => {
    if (!searchParams || !searchParams.business_group) {
      return;
    }

    const loadEvents = async () => {
      const startTime = Date.now();

      try {
        setEventLoading(true);

        const data = await leaveAPI.getLeavesHistory(searchParams);
        setEvents(data.map((item, index) => mapLeaveToEvent(item, index)));
      } catch (err) {
        notify("error", "Error", "Load leave history failed", 1.5);
        setEvents([]);
      } finally {
        const elapsed = Date.now() - startTime;
        const remaining = MIN_SEARCH_LOADING - elapsed;

        if (remaining > 0) {
          setTimeout(() => setEventLoading(false), remaining);
        } else {
          setEventLoading(false);
        }
      }
    };

    loadEvents();
  }, [searchParams]);

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

  const goToPreviousMonth = () => {
    setDirection("prev");
    setViewMonth((d) => d.subtract(1, "month"));
  };

  const goToNextMonth = () => {
    setDirection("next");
    setViewMonth((d) => d.add(1, "month"));
  };

  const goToToday = () => {
    const currentMonth = dayjs();

    setViewMonth(currentMonth);
    setDraftMonth(currentMonth);

    setSearchParams((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        date: currentMonth.format("YYYY-MM"),
      };
    });
  };

  const handleResize = () => {
    setWindowHeight(window.innerHeight - 280);
  };

  useEffect(() => {
    setWindowHeight(window.innerHeight - 280);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const scrollToTop = () => {
    if (calendarRef.current) {
      calendarRef.current.scrollTop = 0;

      calendarRef.current.scroll({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (calendarRef.current) {
        const scrollTop = calendarRef.current.scrollTop;

        if (scrollTop >= 3000) {
          setIsVisibilityScroll(true);
        } else {
          setIsVisibilityScroll(false);
        }
      }
    };

    const calendarElement = calendarRef.current;
    if (calendarElement) {
      calendarElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (calendarElement) {
        calendarElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Loading */}
      {loading && <AppLoading />}

      <div
        className={`h-full flex flex-col transition-opacity duration-500 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* ===== Top Header ===== */}
        <Header />

        <div className="box-border px-8">
          <div className="hidden md:block">
            <div className="flex text-sm items-center gap-2 font-semibold">
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                  isPM
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-amber-50 text-amber-500"
                }`}
              >
                {isPM ? (
                  <span className="text-base">
                    <MoonFilled />
                  </span>
                ) : (
                  <span className="text-base">
                    <SunFilled />
                  </span>
                )}
              </div>

              <span
                className={`inline font-medium text-sm ${
                  isPM ? "text-indigo-600" : "text-amber-500"
                }`}
              >
                {now.format("D MMM,YYYY - hh:mm:ss A")}
              </span>
            </div>
          </div>

          <div
            className="hidden md:flex flex-col flex-1 overflow-hidden box-border p-5 mt-4 rounded-2xl bg-white"
            style={{ boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px" }}
          >
            <div className="flex">
              {/* Filter Bar */}
              <div className="w-full mx-auto flex flex-col h-full overflow-hidden">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={(values) => handleSearch(values, draftMonth)}
                  initialValues={{
                    business_group: "",
                    factory: ["all"],
                    department: ["all"],
                    // leaveDate: dayjs(now).format("MMMM YYYY")
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-end gap-2">
                    <Space size={8} align="end" wrap>
                      {/* Business */}
                      <Form.Item
                        label="事業群"
                        name="business_group"
                        className="mb-0"
                      >
                        <Select
                          options={businessGroupOptions}
                          maxTagCount={2}
                          style={{ width: 160 }}
                        />
                      </Form.Item>

                      {/* Factory */}
                      <Form.Item label="廠別" name="factory" className="mb-0">
                        <Select
                          mode="multiple"
                          options={factoryOptions}
                          maxTagCount={2}
                          style={{ width: 160 }}
                          tagRender={(props) => {
                            if (props.value === "all") return <></>;
                            return (
                              <SelectTag
                                {...props}
                                selectedCount={
                                  selectedFactories?.includes("all")
                                    ? 0
                                    : selectedFactories?.length
                                }
                              />
                            );
                          }}
                          allowClear
                          onChange={(values) =>
                            handleMultiChange("factory", values, factoryOptions)
                          }
                        />
                      </Form.Item>

                      {/* Department */}
                      <Form.Item
                        label="部門"
                        name="department"
                        className="mb-0"
                      >
                        <Select
                          mode="multiple"
                          options={departmentOptions}
                          maxTagCount={2}
                          style={{ width: 180 }}
                          onChange={(values) =>
                            handleMultiChange(
                              "department",
                              values,
                              departmentOptions,
                            )
                          }
                          // loading={departmentOptions.length === 0}
                          tagRender={(props) => {
                            if (props.value === "all") return <></>;
                            return (
                              <SelectTag
                                {...props}
                                selectedCount={
                                  selectedDepartments?.includes("all")
                                    ? 0
                                    : selectedDepartments?.length
                                }
                              />
                            );
                          }}
                          allowClear
                        />
                      </Form.Item>

                      {/* Name */}
                      <Form.Item label="姓名" name="name" className="mb-0">
                        <Input allowClear style={{ width: 160 }} />
                      </Form.Item>

                      {/* Leave Date */}
                      <Form.Item label="休假日期" className="mb-0">
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
                        />
                      </Form.Item>

                      {/* Search button */}
                      <Form.Item className="mb-0">
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="text-white rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-base text-sm !hover:text-white px-4 py-2.5 text-center leading-5"
                        >
                          查詢
                        </Button>
                      </Form.Item>
                    </Space>
                  </div>
                </Form>
              </div>

              {/* Navigation Bar */}
              <div className="flex justify-end gap-4 items-end">
                <CalendarNavigation
                  goToToday={goToToday}
                  goToPreviousMonth={goToPreviousMonth}
                  goToNextMonth={goToNextMonth}
                />
              </div>
            </div>

            {/* Calendar Grid - Scrollable */}
            <div
              className="flex-1 overflow-y-auto pb-2 mt-5"
              style={{ maxHeight: `${windowHeight}px` }}
              ref={calendarRef}
            >
              <div className="min-w-[768px] lg:min-w-full border rounded-t-xl">
                {/* Day Headers */}
                <div
                  className="sticky top-0 grid grid-cols-7 text-center text-white text-xs
                   z-[5] rounded-t-xl 
                  bg-[#1e64ee] py-5"
                >
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                    (day) => (
                      <div key={day}>{day}</div>
                    ),
                  )}
                </div>

                <div className="relative">
                  <SearchLoadingOverlay visible={eventLoading} />
                  {/* Weeks */}
                  <div
                    key={viewMonth.format("YYYY-MM")}
                    className={`transition-all duration-300 ease-out ${
                      direction === "next" ? "animate-slide-left" : ""
                    } ${direction === "prev" ? "animate-slide-right" : ""}`}
                  >
                    {calendarGrid.map((week, weekIndex) => (
                      <div
                        key={weekIndex}
                        className="relative mb-2 overflow-visible"
                        style={{ height: getWeekHeight(weekIndex) }}
                      >
                        {/* Date Numbers */}
                        <div className="grid grid-cols-7 text-center text-sm text-gray-500 relative z-[1]">
                          {week.map((date, i) => {
                            const isToday = date.isSame(now, "day");
                            const isCurrentMonth =
                              date.month() === viewMonth.month();

                            return (
                              <div
                                key={i}
                                className={`h-[48px] px-1 pt-1 text-center text-sm ${
                                  isCurrentMonth
                                    ? "text-gray-700"
                                    : "text-gray-400"
                                }`}
                              >
                                <span
                                  className={`inline-flex items-center justify-center w-6 h-6 text-sm ${
                                    isToday
                                      ? "rounded-full bg-blue-600 text-white font-semibold"
                                      : "font-bold"
                                  }`}
                                >
                                  {date.date() === 1 ? (
                                    <span className="flex items-center leading-tight">
                                      <span className="mr-1 text-xs">
                                        {date.format("MMM")}
                                      </span>
                                      <span>{date.date()}</span>
                                    </span>
                                  ) : (
                                    date.date()
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Grid Background & Events */}
                        <div className="absolute inset-0 z-[2]">
                          <div
                            className="absolute inset-0 z-[1] pointer-events-none"
                            style={{
                              backgroundImage:
                                "radial-gradient(circle, rgba(46,193,251,0.35) 1px, transparent 1px)",
                              backgroundSize: GRID_BACKGROUND_SIZE,
                            }}
                          />

                          {/* Event Bars */}
                          {eventBars
                            .filter((b) => b.weekIndex === weekIndex)
                            .map((bar, idx) => (
                              <Popover
                                key={idx}
                                content={<EventPopover event={bar.event} />}
                                trigger="hover"
                                mouseEnterDelay={0.2}
                                placement="top"
                              >
                                <div
                                  className="absolute z-[3] rounded-xl shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5 flex items-center overflow-hidden cursor-pointer"
                                  style={{
                                    left: `calc(${
                                      (bar.startCol / 7) * 100
                                    }% + ${bar.startCol * 4}px)`,
                                    width: `calc(${(bar.span / 7) * 100}% - ${
                                      (7 - bar.span) * 4
                                    }px)`,
                                    top: `${38 + bar.row * 36}px`,
                                    minHeight: "32px",
                                    backgroundColor: bar.event.color,
                                  }}
                                >
                                  <div
                                    className="h-full w-[5px]"
                                    style={{
                                      backgroundColor: bar.event.color,
                                    }}
                                  />
                                  <div className="px-2 py-0.5 overflow-hidden">
                                    <div className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">
                                      {bar.event.facName} - {bar.event.title} (
                                      {bar.event.leaveSummary})
                                    </div>

                                    {bar.event.startTime &&
                                      bar.event.endTime && (
                                        <div className="text-[10px] text-gray-500 line-clamp-1">
                                          {bar.event.startTime} -{" "}
                                          {bar.event.endTime}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </Popover>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden h-full overflow-hidden">
          <MobileCalendar />
        </div>
      </div>

      {isVisibilityScroll && (
        <FloatButton
          shape="circle"
          type="primary"
          icon={<ArrowUpOutlined />}
          style={{
            width: "55px",
            height: "55px",
            right: 24,
            bottom: 24,
            backgroundColor: "#1e64ee",
            color: "#fff",
          }}
          onClick={scrollToTop}
        />
      )}
    </div>
  );
};

export default CalendarApp;
