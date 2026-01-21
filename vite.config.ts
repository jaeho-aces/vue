import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        // FastAPI 백엔드 프록시 설정
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')  // /api 제거 후 전달
        },
        // PHP 백엔드 프록시 설정 (기존 호환성 유지)
        '/web': {
          target: 'http://172.16.17.11:8080',  // PHP 서버 주소
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/web/, '')  // /web 제거 후 전달
        }
      }
    },
    define: {
      // 환경 변수를 런타임에 사용할 수 있도록 정의
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV || 'development')
    }
  }
})

