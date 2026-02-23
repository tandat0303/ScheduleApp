import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import type React from "react";
import type { NavigationProps } from "../types";

const CalendarNavigation: React.FC<NavigationProps> = ({
  goToToday,
  goToPreviousMonth,
  goToNextMonth,
}) => {
  return (
    <>
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
    </>
  );
};

export default CalendarNavigation;
