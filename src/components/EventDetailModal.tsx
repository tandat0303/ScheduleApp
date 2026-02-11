import React from "react";
import { Modal, Grid } from "antd";
import dayjs from "dayjs";
import type { EventDetailProps } from "../types";
import {
  formatDate,
  getDatesBetween,
  INDEX_LABEL_MAP,
  mergeContinuousDates,
} from "../lib/helpers";
import { CloseOutlined } from "@ant-design/icons";

const EventDetailModal: React.FC<EventDetailProps> = ({
  event,
  open,
  onClose,
}) => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={isMobile ? "92%" : 480}
      styles={{
        body: {
          padding: isMobile ? "24px 20px" : "32px 28px",
        },
      }}
      closeIcon={
        <CloseOutlined className="text-gray-500 hover:text-gray-800 text-base" />
      }
      // modalRenderToBody
    >
      {event &&
        (() => {
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

          // 在地休
          if (data.IsStayComLoc && data.StayComDates) {
            const rawDates = data.StayComDates.split(",");
            const pureDates = rawDates.filter(
              (d: string) => !occupiedDates.has(d),
            );

            if (pureDates.length > 0) {
              const ranges = mergeContinuousDates(pureDates);

              leaveRows.push(
                <div key="staycomloc">
                  • <span className="font-medium">在地休</span>：
                  {ranges.join(", ")}
                  {data.LocationTo2 && ` (${data.LocationTo2})`}
                  {data.DateTimeQty2 && `，共 ${data.DateTimeQty2} 天`}
                </div>,
              );
            }
          }

          // 其他假別
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
                {data[`DateTimeQty${i}`] &&
                  `，共 ${data[`DateTimeQty${i}`]} 天`}
              </div>,
            );
          });

          return (
            <div className="space-y-4">
              {/* ===== Header ===== */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {data.EmployeeNameChinese}
                  </div>
                  <div className="text-sm text-gray-500">休假申請詳情</div>
                </div>

                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {data.FactoryName}
                  {data.DeptName ? ` - ${data.DeptName}` : ""}
                </div>
              </div>

              <div className="h-px bg-gray-200" />

              {/* ===== Leave count ===== */}
              <div className="text-gray-700 text-sm">
                本年度第{" "}
                <span className="font-semibold text-blue-600">
                  {data.This_year_leave_time}
                </span>{" "}
                次休假
              </div>

              <div className="text-gray-700 text-sm">
                休假期間：{" "}
                <span className="font-semibold text-blue-600">
                  {formatDate(data.StartDate)} ~ {formatDate(data.EndDate)}
                </span>
                ，共{" "}
                <span className="font-semibold text-blue-600">
                  {data.Total_leave_days}
                </span>
                天
              </div>

              {/* ===== Leave detail ===== */}
              <div className="text-gray-700 text-sm">
                <div className="space-y-1">{leaveRows}</div>
              </div>
            </div>
          );
        })()}
    </Modal>
  );
};

export default EventDetailModal;
