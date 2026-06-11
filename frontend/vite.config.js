import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" makes asset URLs relative, so the same build works at the GitHub
// Pages subpath (/ai-security-taxonomy-feed/) and on any other static host.
// host: true + allowedHosts: true let the dev server work behind Replit's
// proxy (*.replit.dev hostnames).
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 3000,
  },
});
