import type { CalendarEvent, LeaveHistoryItem } from "../types";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

const accentColors = {
  orange: "#FF9B2E",
  red: "#FF735C",
  cyan: "#2EC1FB",
  green: "#9EFF57",
};

const withAlpha = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const accentColorList = Object.values(accentColors);

export const getAccentColorByIndex = (index: number, alpha = 0.9) => {
  const color = accentColorList[index % accentColorList.length];
  return withAlpha(color, alpha);
};

const LEAVE_TYPE_MAP = [
  { key: "IsBackHome", label: "回國休" },
  { key: "IsStayComLoc", label: "在地休" },
  { key: "IsStayForeign", label: "第3地休" },
  { key: "IsStayOther", label: "其他" },
] as const;

export const INDEX_LABEL_MAP: Record<number, string> = {
  1: "回國休",
  3: "第3地休",
  4: "其他",
};

export const formatDate = (d: string) => dayjs(d).format("M/D");

const buildDatePeriod = (ranges: { start: string; end: string }[]) => {
  return ranges
    .map(({ start, end }) => {
      if (start === end) return formatDate(start);
      return `${formatDate(start)}~${formatDate(end)}`;
    })
    .join(", ");
};

const buildStayComLocPeriod = (stayComDates?: string) => {
  if (!stayComDates) return "";

  const dates = stayComDates
    .split(",")
    .map((d) => dayjs(d))
    .sort((a, b) => a.valueOf() - b.valueOf());

  const ranges: { start: dayjs.Dayjs; end: dayjs.Dayjs }[] = [];

  dates.forEach((date) => {
    const last = ranges[ranges.length - 1];

    if (!last) {
      ranges.push({ start: date, end: date });
    } else if (date.diff(last.end, "day") === 1) {
      last.end = date;
    } else {
      ranges.push({ start: date, end: date });
    }
  });

  return ranges
    .map((r) =>
      r.start.isSame(r.end, "day")
        ? r.start.format("M/D")
        : `${r.start.format("M/D")}~${r.end.format("M/D")}`,
    )
    .join(", ");
};

export const buildLeaveSummary = (item: LeaveHistoryItem) => {
  const parts: string[] = [];

  LEAVE_TYPE_MAP.forEach(({ key, label }) => {
    if (!item[key as keyof LeaveHistoryItem]) return;

    if (key === "IsStayComLoc") {
      const period = buildStayComLocPeriod(item.StayComDates);
      if (period) {
        parts.push(`${label}：${period}`);
      }
      return;
    }

    const ranges: { start: string; end: string }[] = [];

    for (let i = 1; i <= 4; i++) {
      const s = item[`StartDate${i}` as keyof LeaveHistoryItem] as string;
      const e = item[`EndDate${i}` as keyof LeaveHistoryItem] as string;

      if (s && e) {
        ranges.push({ start: s, end: e });
      }
    }

    if (ranges.length) {
      parts.push(`${label}：${buildDatePeriod(ranges)}`);
    }
  });

  return parts.join("、");
};

export const mapLeaveToEvent = (
  item: LeaveHistoryItem,
  index: number,
): CalendarEvent => {
  const leaveSummary = buildLeaveSummary(item);

  return {
    id: `${item.EmpID}_${item.StartDate}`,
    title: item.EmployeeNameChinese,
    facName: item.FactoryName,
    deptName: item.DeptName,
    leaveSummary: leaveSummary,
    startDate: item.StartDate,
    endDate: item.EndDate,
    color: getAccentColorByIndex(index, 0.4),
    meta: item,
  };
};

export function mergeContinuousDates(dates: string[]): string[] {
  if (!dates.length) return [];

  const sorted = dates
    .map((d) => dayjs(d))
    .sort((a, b) => a.valueOf() - b.valueOf());

  const result: string[] = [];

  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];

    if (curr.diff(prev, "day") === 1) {
      prev = curr;
    } else {
      result.push(
        start.isSame(prev, "day")
          ? start.format("M/D")
          : `${start.format("M/D")} ~ ${prev.format("M/D")}`,
      );
      start = curr;
      prev = curr;
    }
  }

  result.push(
    start.isSame(prev, "day")
      ? start.format("M/D")
      : `${start.format("M/D")} ~ ${prev.format("M/D")}`,
  );

  return result;
}

export function getDatesBetween(start: string, end: string): string[] {
  const result: string[] = [];
  let curr = dayjs(start);

  while (curr.isSameOrBefore(dayjs(end), "day")) {
    result.push(curr.format("YYYY-MM-DD"));
    curr = curr.add(1, "day");
  }

  return result;
}
