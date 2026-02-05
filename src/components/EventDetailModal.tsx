import React from "react";
import { Modal, Tag, Grid } from "antd";
import dayjs from "dayjs";
import type { EventDetailProps } from "../types";
import { Calendar, CalendarRange, Clock } from "lucide-react";

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
      width={isMobile ? "92%" : 520}
      styles={{
        body: {
          padding: isMobile ? "16px 14px" : "20px",
        },
      }}
    >
      {event && (
        <div className="space-y-4 rounded-lg">
          {/* Title */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {event.title}
            </h2>

            <Tag
              color={
                event.color === "purple"
                  ? "purple"
                  : event.color === "yellow"
                    ? "gold"
                    : event.color === "cyan"
                      ? "cyan"
                      : "default"
              }
            >
              {event.color.toUpperCase()}
            </Tag>
          </div>

          {/* Date */}
          <div className="text-sm sm:text-base text-gray-600 flex">
            <Calendar className="mr-2" />{" "}
            {dayjs(event.startDate).format("DD MMM YYYY")}
            {event.startDate !== event.endDate &&
              ` - ${dayjs(event.endDate).format("DD MMM YYYY")}`}
          </div>

          {/* Time */}
          <div className="text-sm sm:text-base text-gray-600 flex">
            <Clock className="mr-2" /> {event.startTime} - {event.endTime}
          </div>

          {/* Duration */}
          <div className="text-sm sm:text-base text-gray-600 flex">
            <CalendarRange className="mr-2" /> Duration:{" "}
            {dayjs(event.endDate).diff(dayjs(event.startDate), "day") + 1}{" "}
            day(s)
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EventDetailModal;
