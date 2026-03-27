import { useEffect, useState } from "react";
import { getIPApi } from "../services/getIPAddress.api";

const FIXED_IP = "192.168.12.197";

const CUSTOM_IPS: string[] = ["192.168.18.138", "192.168.18.2"];

export type IPMode = "loading" | "fixed" | "custom" | "blocked";

export const useIPGuard = () => {
  const [mode, setMode] = useState<IPMode>("loading");
  const [clientIP, setClientIP] = useState<string>("");

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const res = await getIPApi.getIpAddress();
        const ip = (await res.text()).trim();
        setClientIP(ip);

        if (ip === FIXED_IP) {
          setMode("fixed");
        } else if (CUSTOM_IPS.includes(ip)) {
          setMode("custom");
        } else {
          setMode("blocked");
        }
      } catch {
        setMode("blocked");
      }
    };

    fetchIP();
  }, []);

  return { mode, clientIP };
};
