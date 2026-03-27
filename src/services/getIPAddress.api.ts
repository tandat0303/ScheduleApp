const BASE_URL = `${import.meta.env.VITE_URLS}/back-end/data/schedule-app.php`;

export const getIPApi = {
  async getIpAddress() {
    const res = await fetch(`${BASE_URL}?Action=ip`);

    if (!res.ok) throw new Error("Failed to get IP Address");

    return res;
  },
};
