// config/socket.js
import { io } from "socket.io-client";

// Replace with your backend URL and port
const BACKEND_URL = "http://localhost:5000";

export const initSocket = async () => {
  const socket = io(BACKEND_URL, {
    transports: ["websocket"], // optional: for stability
    reconnectionAttempts: 3,
    timeout: 10000,
  });

  return socket;
};
