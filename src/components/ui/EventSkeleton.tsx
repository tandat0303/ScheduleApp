export const EventSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse" />
    ))}
  </div>
);
