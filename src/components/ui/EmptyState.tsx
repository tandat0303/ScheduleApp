import { motion } from "framer-motion";
import EmptyEventIcon from "../../assets/no-events.png";

export const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.25 }}
    className="text-center py-14"
  >
    <img
      src={EmptyEventIcon}
      alt="No events"
      className="mx-auto mb-4 w-20 h-20 opacity-80"
    />
    <div className="text-lg font-semibold text-gray-500">
      No events for this day
    </div>
    <div className="text-sm text-gray-400 mt-1">Enjoy your free time ✨</div>
  </motion.div>
);
