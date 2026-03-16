import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/layout.css'

if (import.meta.env.DEV) {
  ;(window as unknown as { __VITE_AMS7000_SERVER?: string }).__VITE_AMS7000_SERVER =
    import.meta.env.VITE_AMS7000_SERVER as string
}

const ACES_SCRIPTS = [
  '/aces/md5.js',
  '/aces/AcesServer.js',
  '/aces/AcesVideo.js',
  '/aces/AcesServerHDS7000.js',
  '/aces/AcesServerAMS7000.js'
]

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.src = src
    el.onload = () => resolve()
    el.onerror = () => reject(new Error(`스크립트 로드 실패: ${src}`))
    document.head.appendChild(el)
  })
}

async function ensureAcesLoaded(): Promise<void> {
  if (typeof window !== 'undefined' && typeof (window as unknown as { AcesServerAMS7000?: unknown }).AcesServerAMS7000 === 'function') return
  for (const src of ACES_SCRIPTS) {
    await loadScript(src)
  }
}

function mountApp() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)
  app.mount('#app')
}

ensureAcesLoaded()
  .then(mountApp)
  .catch(() => {
    mountApp()
  })

