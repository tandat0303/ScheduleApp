import React from "react";
import type { CalendarEvent } from "../types";
import dayjs from "dayjs";
import {
  formatDate,
  getDatesBetween,
  INDEX_LABEL_MAP,
  mergeContinuousDates,
} from "../lib/helpers";

export const EventPopover: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  const data = event.meta;
  const leaveRows: React.ReactNode[] = [];

  const occupiedDates = new Set<string>();

  const OTHER_STAY_INDEX = [1, 3, 4];

  OTHER_STAY_INDEX.forEach((i) => {
    const start = data[`StartDate${i}`];
    const end = data[`EndDate${i}`];

    if (!start || !end) return;

    getDatesBetween(start, end).forEach((d) => occupiedDates.add(d));
  });

  if (data.IsStayComLoc && data.StayComDates) {
    const rawDates = data.StayComDates.split(",");

    const pureStayComLocDates: string[] = rawDates.filter(
      (d: string) => !occupiedDates.has(d),
    );

    if (pureStayComLocDates.length > 0) {
      const ranges = mergeContinuousDates(pureStayComLocDates);

      leaveRows.push(
        <div key="staycomloc">
          • <span className="font-medium">在地休</span>：{ranges.join(", ")}
          {data.LocationTo2 && ` (${data.LocationTo2})`}
          {data.DateTimeQty2 && `，共${data.DateTimeQty2}天`}
        </div>,
      );
    }
  }

  [1, 3, 4].forEach((i) => {
    const start = data[`StartDate${i}`];
    const end = data[`EndDate${i}`];
    if (!start || !end) return;

    if (i === 1 && !data.IsBackHome) return;
    if (i === 3 && !data.IsStayForeign) return;
    if (i === 4 && !data.IsStayOther) return;

    leaveRows.push(
      <div key={`leave-${i}`}>
        • <span className="font-medium">{INDEX_LABEL_MAP[i]}</span>：
        {dayjs(start).format("M/D")} ~ {dayjs(end).format("M/D")}
        {data[`LocationTo${i}`] && ` (${data[`LocationTo${i}`]})`}
        {data[`DateTimeQty${i}`] && `，共${data[`DateTimeQty${i}`]}天`}
      </div>,
    );
  });

  return (
    <div className="max-w-[400px] text-sm leading-relaxed">
      <div className="flex justify-between items-start mb-2">
        <div className="font-semibold text-gray-900">
          {data.EmployeeNameChinese}
        </div>

        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
          {data.FactoryName} {data.DeptName ? `- ${data.DeptName}` : ""}
        </div>
      </div>

      {/* ===== Leave count ===== */}
      <div className="text-gray-700 mb-2">
        本年度第{" "}
        <span className="font-semibold text-blue-600">
          {data.This_year_leave_time}
        </span>{" "}
        次休假
      </div>

      <div className="text-gray-700 mb-2">
        休假期間：{" "}
        <span className="font-semibold text-blue-600">
          {formatDate(data.StartDate)} ~ {formatDate(data.EndDate)}
        </span>{" "}
        ，共計{""}
        <span className="font-semibold text-blue-600">
          {data.Total_leave_days}
        </span>
        天
      </div>

      {/* ===== Leave detail ===== */}
      <div className="text-gray-700">
        <div className="space-y-0.5">{leaveRows}</div>
      </div>
    </div>
  );
};
