// config/socket.js
import { io } from "socket.io-client";

// Use VITE_ prefixed env variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5173";

export const initSocket = async () => {
  const socket = io(BACKEND_URL, {
    transports: ["websocket"],
    reconnectionAttempts: 3,
    timeout: 10000,
  });

  return socket;
};
