import React from "react";
import type { SelectTagProps } from "../../types";

const SelectTag: React.FC<SelectTagProps> = ({
  label,
  value,
  closable,
  onClose,
  selectedCount,
}) => {
  if (value === "all" && selectedCount === 1) {
    return null;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0 8px",
        height: 24,
        marginRight: 4,
        backgroundColor: "#f0f0f0",
        border: "1px solid #d9d9d9",
        borderRadius: 4,
      }}
    >
      {label}
      {closable && (
        <span
          onClick={onClose}
          style={{
            marginLeft: 4,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          ×
        </span>
      )}
    </span>
  );
};

export default SelectTag;
