import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  // IMPORTANT: This must match your GitHub repository name exactly. 
  // If your repo is named 'hci_project', keep it like this:
  base: "/hci_project/", 
  
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Removed the @assets alias that pointed outside the project to prevent build errors
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    // Outputs the static HTML/CSS/JS to a standard 'dist' folder
    outDir: "dist", 
    emptyOutDir: true,
  }
});
