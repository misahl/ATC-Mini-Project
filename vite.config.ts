import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleVisionScanRequest } from './server/visionHandler.ts'

const visionApiPlugin = (): Plugin => ({
  name: 'vision-api-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.startsWith('/api/')) {
        handleVisionScanRequest(req, res);
      } else {
        next();
      }
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.startsWith('/api/')) {
        handleVisionScanRequest(req, res);
      } else {
        next();
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    visionApiPlugin(),
  ],
  server: {
    host: true, // binds to 0.0.0.0 so both localhost and 127.0.0.1 work
    port: 5173,
    strictPort: false,
  },
})
