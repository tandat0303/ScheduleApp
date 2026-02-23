import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { Form, type FormInstance } from "antd";
import type { SearchParams } from "../types";

import { businessGroupAPI } from "../services/business-group.api";
import { factoryAPI } from "../services/factory.api";
import { departmentAPI } from "../services/department.api";
import { notify } from "../components/ui/Notification";
import { resolveFactoryIds } from "../lib/helpers";

export const useLeaveFilter = (form: FormInstance) => {
  const [businessGroupOptions, setBusinessGroupOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [factoryOptions, setFactoryOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [departmentOptions, setDepartmentOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const selectedBusinessGroup = Form.useWatch("business_group", form);
  const selectedFactories = Form.useWatch("factory", form);

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const data = await businessGroupAPI.getAllBusinessGroup();
        setBusinessGroupOptions(data);

        if (data?.length) {
          const first = data[0].value;

          form.setFieldsValue({
            business_group: first,
            factory: ["all"],
            department: ["all"],
          });

          setSearchParams({
            business_group: first,
            factory: "all",
            department: "all",
            name: "",
            date: dayjs().format("YYYY-MM"),
          });
        }
      } catch {
        notify("error", "Error", "Load business group failed", 1.5);
      }
    };

    loadBusiness();
  }, []);

  useEffect(() => {
    if (!selectedBusinessGroup) return;

    const loadFactories = async () => {
      try {
        const data = await factoryAPI.getAllFactories(selectedBusinessGroup);

        setFactoryOptions([{ label: "全部", value: "all" }, ...data]);

        if (!selectedFactories?.length) {
          form.setFieldValue("factory", ["all"]);
        }

        form.setFieldValue("department", ["all"]);
      } catch {
        notify("error", "Error", "Load factories failed", 1.5);
      }
    };

    loadFactories();
  }, [selectedBusinessGroup]);

  useEffect(() => {
    if (!selectedFactories || !factoryOptions.length) return;

    const loadDepartments = async () => {
      try {
        const factoryIds = resolveFactoryIds(selectedFactories, factoryOptions);

        const data = await departmentAPI.getAllDepartments(factoryIds);

        setDepartmentOptions([{ label: "全部", value: "all" }, ...data]);

        if (!form.getFieldValue("department")?.length) {
          form.setFieldValue("department", ["all"]);
        }
      } catch {
        setDepartmentOptions([]);
      }
    };

    loadDepartments();
  }, [selectedFactories]);

  const handleMultiChange = useCallback(
    (
      field: "factory" | "department",
      values: string[],
      options: { value: string }[],
    ) => {
      const realOptions = options.filter((o) => o.value !== "all");

      if (!values || values.length === 0) {
        form.setFieldValue(field, ["all"]);
        return;
      }

      if (values.includes("all") && values.length > 1) {
        const filtered = values.filter((v) => v !== "all");
        form.setFieldValue(field, filtered);
        return;
      }

      if (values.length === realOptions.length && !values.includes("all")) {
        form.setFieldValue(field, ["all"]);
        return;
      }

      form.setFieldValue(field, values);
    },
    [form],
  );

  const handleSearch = useCallback((values: any, draftMonth: dayjs.Dayjs) => {
    const factory =
      !values.factory || values.factory.includes("all")
        ? "all"
        : values.factory.filter((f: string) => f !== "all");

    const department =
      !values.department || values.department.includes("all")
        ? "all"
        : values.department.filter((d: string) => d !== "all");

    setSearchParams({
      business_group: values.business_group,
      factory,
      department,
      name: values.name || "",
      date: draftMonth.format("YYYY-MM"),
    });
  }, []);

  return {
    businessGroupOptions,
    factoryOptions,
    departmentOptions,
    searchParams,
    setSearchParams,
    handleMultiChange,
    handleSearch,
  };
};
