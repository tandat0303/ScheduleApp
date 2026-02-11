import type { FactoryOption, FactoryResponse } from "../types";

const BASE_URL = `${import.meta.env.VITE_URLS}/back-end/data/schedule-app.php`;

export const factoryAPI = {
  async getAllFactories(business_group: string): Promise<FactoryOption[]> {
    if (!business_group) return [];

    const res = await fetch(
      `${BASE_URL}?Action=factory&Business_Group_Type=${business_group}`,
    );

    if (!res.ok) {
      throw new Error("Failed to fetch factory");
    }

    const data = await res.json();

    const factories: FactoryResponse[] = data?.factory || [];

    const options: FactoryOption[] = factories.map((f) => ({
      label: f.FactoryName,
      value: f.FactoryID,
    }));

    return [...options];
  },
};
