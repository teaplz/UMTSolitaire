import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({mode}) => {
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
              src: "favicon.ico",
              sizes: "48x48 32x32 16x16",
              type: "image/x-icon",
            },
            {
              src: "icon-192.png",
              type: "image/png",
              sizes: "192x192",
            },
            {
              src: "icon-512.png",
              type: "image/png",
              sizes: "512x512",
            },
            {
              src: "icon-512m.png",
              type: "image/png",
              sizes: "512x512",
              purpose: "maskable",
            },
          ],
          start_url: ".",
          display: "standalone",
          theme_color: "#6c9382",
          background_color: "#6c9382",
        },
      }),
    ],
  };
});
