import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const FILE_ID = env.VITE_DRIVE_FILE_ID || '';
  const API_KEY = env.VITE_DRIVE_API_KEY || '';

  return {
    plugins: [react()],

    // Dev server: proxy /api/* to googleapis so local dev works
    // without needing `vercel dev`
    server: {
      proxy: {
        '/api/excel': {
          target: 'https://www.googleapis.com',
          changeOrigin: true,
          rewrite: () => `/drive/v3/files/${FILE_ID}?alt=media&key=${API_KEY}`,
        },
        '/api/metadata': {
          target: 'https://www.googleapis.com',
          changeOrigin: true,
          rewrite: () => `/drive/v3/files/${FILE_ID}?fields=name,modifiedTime&key=${API_KEY}`,
        },
      },
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
        exclude: ['src/main.jsx', '*.config.js', 'src/setupTests.js'],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
          },
        },
      },
    },
  };
});
