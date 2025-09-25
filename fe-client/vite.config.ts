import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.example.com', 'localhost', 'fe-client.example.com'],
    hmr: {
      clientPort: 80, // Use port 80 for HMR WebSocket connections
      host: 'fe-client.example.com'
    }
  },
});

/*
We need to set the host to '0.0.0.0' in the Vite config for Docker compatibility.
because by default, Vite binds to 'localhost', which is not accessible from outside the container.
this is necessary for the development server to be reachable when running inside a Docker container.

*/
