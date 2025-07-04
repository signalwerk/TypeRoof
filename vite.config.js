import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "lib",
          dest: ".",
        },
      ],
      structured: true,
      silent: false,
    }),
  ],

  // Set base path to match Eleventy's pathPrefix
  base: "/TypeRoof/",

  // Development server configuration
  server: {
    port: 3000,
    open: "/TypeRoof/shell.html",
    proxy: {
      // Only proxy documentation routes to Eleventy, not lib/ assets or Vite internals
      "^/TypeRoof/(docs|live|index\\.html|README|legacy\\.html)": {
        target: "http://localhost:8080",
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            // Handle gracefully when Eleventy isn't running
            console.log(
              "Proxy error (Eleventy may not be running):",
              err.message,
            );
            res.writeHead(502, {
              "Content-Type": "text/html",
            });
            res.end(`<!DOCTYPE html>
              <html lang="en">
                <head>
                  <meta charset="utf-8" />
                  <title>TypeRoof Documentation</title>
                </head>
                <body style="font-family: Arial, sans-serif; padding: 40px;">
                  <h1>Documentation Not Available</h1>
                  <p>The documentation server (Eleventy) is not running.</p>
                  <p>To access documentation, run: <code>npm run dev</code></p>
                  <p>Or start Eleventy separately: <code>npm run dev:doc</code></p>
                  <hr>
                  <p><a href="/TypeRoof/shell.html">← Back to TypeRoof Shell</a></p>
                </body>
              </html>
            `);
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("Proxying request to Eleventy:", req.url);
          });
        },
      },
    },
  },

  // Build configuration
  build: {
    outDir: "dist",
    assetsDir: "assets",
    target: "esnext",
    rollupOptions: {
      input: {
        main: "./shell.html",
      },
    },
  },

  // Path resolution
  resolve: {
    alias: {
      "@js": "/lib/js",
      "@css": "/lib/css",
      "@assets": "/lib/assets",
    },
  },

  // Disable default public directory copying (handled by vite-plugin-static-copy)
  publicDir: false,

  // CSS configuration
  css: {
    devSourcemap: true,
  },
});
