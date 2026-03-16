import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { minify } from 'terser'

/** 빌드 후 dist/aces/*.js 파일을 minify하는 플러그인 */
function acesMinifyPlugin() {
  let outDir = 'dist'
  return {
    name: 'aces-minify',
    configResolved(config: { build?: { outDir?: string } }) {
      outDir = config.build?.outDir ?? 'dist'
    },
    async closeBundle() {
      const acesDir = join(process.cwd(), outDir, 'aces')
      if (!existsSync(acesDir)) return
      const files = readdirSync(acesDir).filter((f) => f.endsWith('.js'))
      for (const f of files) {
        const filePath = join(acesDir, f)
        const code = readFileSync(filePath, 'utf-8')
        const result = await minify(code, { compress: true, mangle: true })
        if (result.code) writeFileSync(filePath, result.code)
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '')
  // 기본 빌드: 분리된 JS/CSS (운영 배포·캐싱에 유리). 단일 HTML은 npm run build:single
  const singleFile = mode === 'singlefile'

  return {
    plugins: [vue(), tailwindcss(), ...(singleFile ? [viteSingleFile()] : []), acesMinifyPlugin()],
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

