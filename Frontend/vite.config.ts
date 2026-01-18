import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, res) => {
              console.log('⚠️  Backend API chưa chạy. Vui lòng chạy backend trước:');
              console.log('   cd Backend');
              console.log('   dotnet run');
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`→ ${req.method} ${req.url}`);
            });
          },
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
