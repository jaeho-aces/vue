import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/layout.css'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

// PrimeVue 설정
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'

// AG Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule])

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})
app.mount('#app')

