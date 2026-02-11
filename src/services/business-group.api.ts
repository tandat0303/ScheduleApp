import type { BusinessGroupOption, BusinessGroupResponse } from "../types";

const BASE_URL = `${import.meta.env.VITE_URLS}/back-end/data/schedule-app.php`;

export const businessGroupAPI = {
  async getAllBusinessGroup(): Promise<BusinessGroupOption[]> {
    const res = await fetch(`${BASE_URL}?Action=business-group`);

    if (!res.ok) {
      throw new Error("Failed to fetch department");
    }

    const data = await res.json();

    const businessGroup: BusinessGroupResponse[] = data?.business_group ?? [];

    return businessGroup.map((b) => ({
      label: b.BusinessGroupName,
      value: b.BusinessGroupType,
    }));
  },
};
