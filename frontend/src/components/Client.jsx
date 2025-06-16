import React from "react";
import Avatar from "@mui/material/Avatar"; // ✅ Fix: import Avatar

// Function to generate a consistent color from a string
function stringToColor(string) {
  let hash = 0;

  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

// Function to generate avatar style and initials
function stringAvatar(name = "") {
  name = name.trim();
  if (!name) {
    return {
      sx: {
        bgcolor: "#666",
        width: 40,
        height: 40,
        fontSize: 16,
      },
      children: "👤",
    };
  }

  const nameParts = name.split(" ");
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`
      : nameParts[0][0];

  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 40,
      height: 40,
      fontSize: 16,
    },
    children: initials.toUpperCase(),
  };
}

// Reusable Client component
function Client({ name, mode = "dark" }) {
  return (
    <div
      className={`flex items-center space-x-2 cursor-pointer rounded-md shadow-sm ${
        mode === "dark"
          ? "bg-zinc-800 text-white"
          : " text-black border border-gray-300"
      }`}
    >
      <Avatar {...stringAvatar(name)} />
      <span className="text-lg bold">{name}</span>
    </div>
  );
}

export default Client;
