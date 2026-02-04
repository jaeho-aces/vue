import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), tailwindcss(), viteSingleFile()],
    base: './',
    server: {
      port: 5173,
      proxy: {
        // FastAPI 백엔드 프록시 설정. Set-Cookie가 브라우저(프론트 호스트)에 저장되도록 보정.
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              const setCookie = proxyRes.headers['set-cookie']
              if (setCookie) {
                const rewritten = (Array.isArray(setCookie) ? setCookie : [setCookie]).map((c: string) =>
                  c
                    .replace(/;\s*Secure/gi, '')
                    .replace(/;\s*Domain=[^;]+/gi, '')
                )
                proxyRes.headers['set-cookie'] = rewritten
              }
            })
          }
        }
      }
    },
    define: {
      // 환경 변수를 런타임에 사용할 수 있도록 정의
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV || 'development')
    }
  }
})

