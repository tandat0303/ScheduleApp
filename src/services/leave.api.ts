import type { LeaveHistoryItem, LeaveHistoryResponse } from "./../types";
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_URLS}/back-end/data/schedule-app.php`;

export const leaveAPI = {
  getLeavesHistory: async (params: {
    business_group?: string;
    factory?: string | string[];
    department?: string | string[];
    name?: string;
    date?: string;
  }): Promise<LeaveHistoryItem[]> => {
    try {
      const res = await axios.get<LeaveHistoryResponse>(`${BASE_URL}`, {
        params: {
          Action: "leave-history",
          Business_Group_Type: params.business_group || "",
          Factory_ID: Array.isArray(params.factory)
            ? params.factory.join(",")
            : params.factory || "",
          Department: Array.isArray(params.department)
            ? params.department.join(",")
            : params.department || "",
          Name: params.name || "",
          Date: params.date || "",
        },
      });

      if (res?.data && res?.data.leave_history) {
        return res.data.leave_history;
      }

      return [];
    } catch (err) {
      throw new Error("Failed to fetch leave history");
    }
  },
};
