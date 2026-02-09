import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, cpSync, existsSync, mkdirSync } from "fs";

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === "development";

  return {
    plugins: [
      react(),
      // Plugin para copiar la documentación al build
      {
        name: 'copy-docs',
        closeBundle() {
          const docsSource = resolve(__dirname, 'docs/site');
          const docsDest = resolve(__dirname, 'dist/docs/site');
          
          if (existsSync(docsSource)) {
            cpSync(docsSource, docsDest, { recursive: true });
            console.log('✅ Documentation copied to dist/docs/site');
          }
        }
      }
    ],
    // ✅ Base según entorno; en Pages usa el nombre del repo (desde VITE_BASE_PATH en el workflow)
    base: isDevelopment ? "/" : `/${process.env.VITE_BASE_PATH || "card-demo-sai3-deividson"}/`,
    resolve: {
      alias: {
        "~": resolve(__dirname, "./app"),
      },
    },
    server: {
      port: 3000,
      open: true,
      host: true,
      proxy: {
        "/api": {
          target: "http://18.217.121.166:8082",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      target: "esnext",
      outDir: "dist",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            mui: [
              "@mui/material",
              "@mui/icons-material",
              "@emotion/react",
              "@emotion/styled",
            ],
            redux: ["@reduxjs/toolkit", "react-redux"],
            router: ["react-router-dom"],
          },
        },
      },
    },
    define: {
      __DEV__: JSON.stringify(isDevelopment),
    },
  };
});