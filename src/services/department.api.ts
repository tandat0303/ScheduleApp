import type { DepartmentOption, DepartmentResponse } from "../types";

const BASE_URL = `${import.meta.env.VITE_URLS}/back-end/data/schedule-app.php`;

export const departmentAPI = {
  async getAllDepartments(factoryIds: string[]): Promise<DepartmentOption[]> {
    const factoryParams = factoryIds.length > 0 ? factoryIds.join(",") : "";

    const res = await fetch(
      `${BASE_URL}?Action=department&Factory_ID=${factoryParams}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch department");
    }

    const data = await res.json();

    const departments: DepartmentResponse[] = data?.department ?? [];

    return departments.map((d) => ({
      label: d.DepartmentName,
      value: d.DepartmentID,
    }));
  },
};
