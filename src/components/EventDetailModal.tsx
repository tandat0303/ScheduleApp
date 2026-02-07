import React from "react";
import { Modal, Grid } from "antd";
import dayjs from "dayjs";
import type { EventDetailProps } from "../types";
import { accentColors } from "../lib/helpers";

const EventDetailModal: React.FC<EventDetailProps> = ({
  event,
  open,
  onClose,
}) => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const durationDays =
    dayjs(event?.endDate).diff(dayjs(event?.startDate), "day") + 1;

  const FieldRow = ({
    label,
    value,
    isLast = false,
  }: {
    label: string;
    value: React.ReactNode;
    isLast?: boolean;
  }) => (
    <div>
      <div className="flex justify-between items-start py-4 md:py-5">
        <span className="text-sm md:text-base font-bold text-gray-800 w-24 md:w-28">
          {label}
        </span>
        <span className="text-sm md:text-base text-gray-500 flex-1 text-right px-4">
          {value}
        </span>
      </div>
      {!isLast && <div className="h-px bg-gray-200" />}
    </div>
  );

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
      closeIcon={null}
      // modalRenderToBody
    >
      {event && (
        <div className="space-y-0">
          {/* Event Name */}
          <FieldRow label="EVENT NAME" value={event.title} />

          {/* Date */}
          <FieldRow
            label="DATE"
            value={
              event.startDate === event.endDate
                ? dayjs(event.startDate).format("ddd, MMM DD")
                : `${dayjs(event.startDate).format("ddd, MMM DD")} - ${dayjs(event.endDate).format("ddd, MMM DD")}`
            }
          />

          {/* Duration */}
          <FieldRow
            label="DURATION"
            value={durationDays === 1 ? "Whole Day" : `${durationDays} days`}
          />

          {/* From Time */}
          <FieldRow label="FROM" value={event.startTime || "-"} />

          {/* Till Time */}
          <FieldRow label="TILL" value={event.endTime || "-"} />

          {/* Type */}
          {/* <FieldRow
            label="TYPE"
            value={event.description ? 'In-Person' : 'Virtual'}
          /> */}

          {/* Location */}
          {/* <FieldRow
            label="LOCATION"
            value={event.description || 'Not specified'}
          /> */}

          {/* Calendar Of */}
          {/* <FieldRow label="CALENDAR OF" value="hi@dvinu.com" /> */}

          {/* Color */}
          <FieldRow
            label="COLOR"
            value={
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded"
                  style={{ backgroundColor: accentColors[event.color] }}
                />
                <span className="capitalize">{event.color}</span>
              </div>
            }
            isLast
          />

          {/* Schedule Event Button */}
          <button className="w-full mt-8 py-3 md:py-4 bg-gray-900 text-white font-semibold rounded-2xl transition-all duration-200 hover:bg-gray-800 active:scale-95">
            Schedule Event
          </button>
        </div>
      )}
    </Modal>
  );
};

export default EventDetailModal;
