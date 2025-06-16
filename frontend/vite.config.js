import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // Import the path module
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()], // Remove tailwindcss() from plugins
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Use path to resolve the src directory
    },
  },
});
