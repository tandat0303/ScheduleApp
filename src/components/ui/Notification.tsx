import { notification } from "antd";

type NotificationType = "success" | "info" | "warning" | "error";

const notify = (
  type: NotificationType,
  message: React.ReactNode,
  description?: React.ReactNode,
  duration: number = 4.5,
) => {
  notification[type]({
    message,
    description,
    duration,
    // placement: "topRight",
  });
};

const destroyNotification = () => {
  notification.destroy();
};

export { notify, destroyNotification };
