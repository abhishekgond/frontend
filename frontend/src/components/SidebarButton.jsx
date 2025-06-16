// SidebarButton.jsx
import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

export default function SidebarButton({ onClick, label, color }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={clsx("w-full py-2 rounded text-white font-medium transition", {
        "bg-green-600 hover:bg-green-700": color === "green",
        "bg-red-600 hover:bg-red-700": color === "red",
      })}
    >
      {label}
    </button>
  );
}

SidebarButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  color: PropTypes.oneOf(["green", "red"]).isRequired,
};
