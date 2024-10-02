import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "/".concat(env.BASE ?? process.env.BASE ?? ""),
    plugins: [
      react(),
      VitePWA({
        includeAssets: [
          "favicon.ico",
          "apple-touch-icon.png",
          "icon-safari-pinned-tab.svg",
        ],
        manifest: {
          short_name: "UMTSolitaire",
          name: "Unicode Mahjong Tile Solitaire",
          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-maskable-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "/pwa-maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
          start_url: ".",
          display: "standalone",
          theme_color: "#657085",
          background_color: "teal",
        },
      }),
    ],
  };
});
