import { Dayjs } from "dayjs";
import type { CustomTagProps } from "rc-select/lib/BaseSelect";

export interface CalendarEvent {
  id: string;
  title: string;
  facName: string;
  deptName: string;
  leaveSummary: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  color: string;
  meta?: any;
}

export interface EventBar {
  event: CalendarEvent;
  startCol: number;
  span: number;
  row: number;
  weekIndex: number;
}

export interface LeaveHistoryItem {
  This_year_leave_time: string;
  BusinessGroupType: string;
  BusinessGroupName: string;
  FactoryID: string;
  FactoryName: string;
  EmpID: string;
  EmployeeNameChinese: string;
  EmployeeNameEnglish: string;
  DeptName: string;
  StartDate: string;
  EndDate: string;
  IsBackHome: string; //回國休
  IsStayComLoc: string; //在地休
  IsStayForeign: string; //第3地休
  IsStayOther: string; //其他(其他)
  Total_leave_days: string;
  StartDate1: string;
  EndDate1: string;
  DateTimeQty1: string;
  LocationTo1: string;
  StayComDates: string;
  DateTimeQty2: string;
  LocationTo2: string;
  StartDate3: string;
  EndDate3: string;
  DateTimeQty3: string;
  LocationTo3: string;
  StartDate4: string;
  EndDate4: string;
  DateTimeQty4: string;
  LocationTo4: string;
}

export interface LeaveHistoryResponse {
  info: string;
  leave_history: LeaveHistoryItem[];
}

export interface EventDetailProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
}

export interface EventRange {
  start: Dayjs;
  end: Dayjs;
  events: CalendarEvent[];
}

export interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  selectedDate?: Dayjs;
  onSave?: (event: CalendarEvent) => void;
}

export type EventType = "Event" | "Meet" | "Tasks";

export interface BusinessGroupOption {
  label: string;
  value: string;
}

export interface BusinessGroupResponse {
  BusinessGroupType: string;
  BusinessGroupName: string;
}

export interface FactoryOption {
  label: string;
  value: string;
}

export interface FactoryResponse {
  FactoryID: string;
  FactoryName: string;
}

export interface DepartmentOption {
  label: string;
  value: string;
}

export interface DepartmentResponse {
  DepartmentID: string;
  DepartmentName: string;
}

export type SearchParams = {
  business_group?: string;
  factory: string[] | "all";
  department: string[] | "all";
  name?: string;
  date: string;
};

export interface NavigationProps {
  goToToday: () => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}

export interface SelectTagProps extends CustomTagProps {
  selectedCount?: number;
}
