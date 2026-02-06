export const accentColors = {
  orange: "#FF9B2E",
  red: "#FF735C",
  cyan: "#2EC1FB",
  green: "#9EFF57",
};

export const withAlpha = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
