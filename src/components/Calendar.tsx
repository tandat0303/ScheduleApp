import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/zh-tw";
import {
  LeftOutlined,
  RightOutlined,
  MoonFilled,
  SunFilled,
  ArrowUpOutlined,
} from "@ant-design/icons";
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
import type { CustomTagProps } from "rc-select/lib/BaseSelect";
import type { CalendarEvent, EventBar, SearchParams } from "../types";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { mapLeaveToEvent } from "../lib/helpers";
import MobileCalendar from "./MobileCalendar";
import { EventPopover } from "./EventPopover";
import LYGLogo from "../assets/LYLogo_White 1.png";
import { factoryAPI } from "../services/factory.api";
import { notify } from "./ui/Notification";
import { departmentAPI } from "../services/department.api";
import { leaveAPI } from "../services/leave.api";
import { businessGroupAPI } from "../services/business-group.api";
import { SearchLoadingOverlay } from "./ui/SearchLoadingOverlay";

dayjs.extend(isoWeek);
dayjs.locale("zh-tw");

const ANIMATION_DURATION = 300;
const LOADING_DURATION = 1800;
const TIME_UPDATE_INTERVAL = 1000;
const GRID_BACKGROUND_SIZE = "16px 16px";
const EVENT_ROW_HEIGHT = 38; // Reduced from 48
const EVENT_BASE_HEIGHT = 56; // Reduced from 72
const MIN_SEARCH_LOADING = 600;

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

  const [businessGroupOptions, setBusinessGroupOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [factoryOptions, setFactoryOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const factorySelectOptions = [
    { label: "全部", value: "all" },
    ...factoryOptions,
  ];

  const [departmentOptions, setDepartmentOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const departmentSelectOptions = [
    { label: "全部", value: "all" },
    ...departmentOptions,
  ];

  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const selectBusinessGroup = Form.useWatch("business_group", form);
  const selectedFactories = Form.useWatch("factory", form);
  const selectedDepartments = Form.useWatch("department", form);

  const isPM = now.hour() >= 12;

  // useEffect(() => {
  //   setSearchParams({
  //     business_group: "",
  //     factory: "all",
  //     department: "all",
  //     name: "",
  //     date: dayjs().format("YYYY-MM"),
  //   });
  // }, []);

  useEffect(() => {
    if (
      !searchParams ||
      !searchParams.business_group ||
      businessGroupOptions.length === 0
    ) {
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
  }, [searchParams, businessGroupOptions]);

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const data = await businessGroupAPI.getAllBusinessGroup();
        setBusinessGroupOptions(data);

        if (data && data.length > 0) {
          const firstOption = data[0].value;

          form.setFieldsValue({
            business_group: firstOption,
          });

          setSearchParams({
            business_group: firstOption,
            factory: "all",
            department: "all",
            name: "",
            date: dayjs().format("YYYY-MM"),
          });
        }
      } catch (err) {
        notify("error", "Error", "Load business group failed", 1.5);
      }
    };

    loadBusiness();
  }, []);

  useEffect(() => {
    if (!selectBusinessGroup || selectBusinessGroup.trim() === "") {
      setFactoryOptions([]);
      form.setFieldsValue({
        factory: ["all"],
        department: ["all"],
      });
      return;
    }

    const loadFactories = async () => {
      try {
        const data = await factoryAPI.getAllFactories(selectBusinessGroup);
        setFactoryOptions(data);

        form.setFieldsValue({
          factory: ["all"],
          department: ["all"],
        });
      } catch (err) {
        notify("error", "Error", "Load factories failed", 1.5);
        setFactoryOptions([]);
      }
    };

    loadFactories();
  }, [selectBusinessGroup, form]);

  useEffect(() => {
    if (!factoryOptions.length) return;

    const loadDepartments = async () => {
      try {
        const factoryIds =
          selectedFactories && selectedFactories.length > 0
            ? selectedFactories.filter((f: string) => f !== "all")
            : factoryOptions.map((f) => f.value);

        const data = await departmentAPI.getAllDepartments(factoryIds);
        setDepartmentOptions(data);

        // Reset department to "all" when factory changes
        if (!selectedDepartments || selectedDepartments.length === 0) {
          form.setFieldValue("department", ["all"]);
        }
      } catch (err) {
        console.error("Load department error:", err);
        setDepartmentOptions([]);
      }
    };

    loadDepartments();
  }, [selectedFactories, factoryOptions]);

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
    const start = viewMonth.startOf("month").startOf("isoWeek");
    const end = viewMonth.endOf("month").endOf("isoWeek");
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
  }, [viewMonth]);

  const eventBars = useMemo(() => {
    const bars: EventBar[] = [];

    calendarGrid.forEach((week, weekIndex) => {
      const rows: { start: Dayjs; end: Dayjs; event: CalendarEvent }[][] = [];

      events.forEach((event) => {
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
  }, [calendarGrid, events]);

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

  const getWeekHeight = useCallback(
    (weekIndex: number) => {
      const eventsInWeek = eventBars.filter((b) => b.weekIndex === weekIndex);
      if (eventsInWeek.length === 0) return `${EVENT_BASE_HEIGHT}px`;
      const maxRows = Math.max(...eventsInWeek.map((b) => b.row + 1));
      return `${EVENT_BASE_HEIGHT + maxRows * EVENT_ROW_HEIGHT}px`;
    },
    [eventBars],
  );

  const handleFactoryChange = (values: string[]) => {
    const previousValues = form.getFieldValue("factory") || [];

    if (values.includes("all") && !previousValues.includes("all")) {
      form.setFieldValue("factory", [
        "all",
        ...factoryOptions.map((f) => f.value),
      ]);
    } else if (!values.includes("all") && previousValues.includes("all")) {
      const filtered = values.filter((v) => v !== "all");
      form.setFieldValue("factory", filtered.length > 0 ? filtered : ["all"]);
    } else if (values.includes("all") && previousValues.includes("all")) {
      const newValues = values.filter((v) => v !== "all");
      form.setFieldValue("factory", newValues.length > 0 ? newValues : ["all"]);
    } else if (values.length === 0) {
      form.setFieldValue("factory", ["all"]);
    } else {
      form.setFieldValue("factory", values);
    }
  };

  const handleDepartmentChange = (values: string[]) => {
    const previousValues = form.getFieldValue("department") || [];

    if (values.includes("all") && !previousValues.includes("all")) {
      form.setFieldValue("department", [
        "all",
        ...departmentOptions.map((d) => d.value),
      ]);
    } else if (!values.includes("all") && previousValues.includes("all")) {
      const filtered = values.filter((v) => v !== "all");
      form.setFieldValue(
        "department",
        filtered.length > 0 ? filtered : ["all"],
      );
    } else if (values.includes("all") && previousValues.includes("all")) {
      const newValues = values.filter((v) => v !== "all");
      form.setFieldValue(
        "department",
        newValues.length > 0 ? newValues : ["all"],
      );
    } else if (values.length === 0) {
      form.setFieldValue("department", ["all"]);
    } else {
      form.setFieldValue("department", values);
    }
  };

  const handleSearch = (values: any) => {
    const factory =
      !values.factory || values.factory.includes("all")
        ? "all"
        : values.factory.filter((f: string) => f !== "all");

    const department =
      !values.department || values.department.includes("all")
        ? "all"
        : values.department.filter((d: string) => d !== "all");

    setViewMonth(draftMonth);

    setSearchParams({
      business_group: values.business_group,
      factory,
      department,
      name: values.name,
      date: draftMonth.format("YYYY-MM"),
    });
  };

  const customTagRender = (props: CustomTagProps) => {
    const { label, value, closable, onClose } = props;

    if (
      value === "all" &&
      (selectedFactories?.length === 1 || selectedDepartments?.length === 1)
    ) {
      return <></>;
    }

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "0 8px",
          height: 24,
          marginRight: 4,
          backgroundColor: "#f0f0f0",
          border: "1px solid #d9d9d9",
          borderRadius: 4,
        }}
      >
        {label}
        {closable && (
          <span
            onClick={onClose}
            style={{
              marginLeft: 4,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            ×
          </span>
        )}
      </span>
    );
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

      // Alternatively, you can use the scroll method with options for smooth behavior:
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
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#EAF7FD] transition-opacity duration-500">
          <DotLottieReact
            src="/Flight.lottie"
            autoplay
            loop
            style={{ width: 220, height: 220 }}
          />
        </div>
      )}

      <div
        className={`h-full flex flex-col transition-opacity duration-500 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* ===== Top Header ===== */}
        <div className="bg-white flex-shrink-0 md:mb-5">
          <div
            className="w-full mx-auto px-8 py-3 flex items-center justify-between"
            style={{ boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px" }}
          >
            {/* Left */}
            <div className="flex items-stretch gap-3">
              {/* LYG – stretch full height */}
              <div className="flex items-center text-2xl md:text-4xl font-extrabold text-[#1e64ee] leading-none">
                LYG
              </div>

              {/* Right text – 2 rows */}
              <div className="flex flex-col justify-between leading-tight">
                <div className="text-xl font-semibold text-gray-900">
                  外籍主管休假行事曆
                </div>
                <div className="text-sm text-gray-500">
                  Expat Manager Leave Calendar
                </div>
              </div>
            </div>

            {/* Right icon */}
            <div className="flex items-center">
              <img
                src={LYGLogo}
                alt="LYG"
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>
        </div>

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
                  onFinish={handleSearch}
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
                          tagRender={customTagRender}
                          allowClear
                        />
                      </Form.Item>

                      {/* Factory */}
                      <Form.Item label="廠別" name="factory" className="mb-0">
                        <Select
                          mode="multiple"
                          options={factorySelectOptions}
                          maxTagCount={2}
                          style={{ width: 160 }}
                          tagRender={customTagRender}
                          allowClear
                          onChange={handleFactoryChange}
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
                          options={departmentSelectOptions}
                          maxTagCount={2}
                          style={{ width: 180 }}
                          onChange={handleDepartmentChange}
                          // loading={departmentOptions.length === 0}
                          tagRender={customTagRender}
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
                <Button
                  type="primary"
                  onClick={goToToday}
                  className="text-white rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-base text-sm !hover:text-white px-4 py-2.5 text-center leading-5"
                >
                  今天
                </Button>
                <div className="flex gap-1">
                  <button
                    onClick={goToPreviousMonth}
                    className="w-8 h-8 text-white bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-orange-300 dark:focus:ring-orange-800 font-medium rounded-full text-sm p-1 text-center"
                  >
                    <LeftOutlined />
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="w-8 h-8 text-white bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-orange-300 dark:focus:ring-orange-800 font-medium rounded-full text-sm p-1 text-center"
                  >
                    <RightOutlined />
                  </button>
                </div>
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
