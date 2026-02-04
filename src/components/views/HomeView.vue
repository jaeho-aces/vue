<template>
  <div class="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
    <!-- Header / Hero Section -->
    <div class="bg-white border-b border-slate-200 shrink-0">
      <div class="max-w-[1800px] mx-auto px-8 py-6">
        <div class="flex justify-between items-start mb-6">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <img src="/ci.svg" alt="logo" class="h-8" />
              <span class="text-xl font-bold text-slate-800">한국도로공사</span>
            </div>
            <h1 class="text-3xl font-bold text-slate-900 mt-4">
              안녕하세요, <span class="text-blue-600">{{ authStore.currentUser?.name || '관리자' }}님</span>
            </h1>
            <p class="text-slate-500 mt-2">
              CCTV 통합 관제 시스템에 접속하셨습니다.
            </p>
          </div>
          <div class="text-right flex flex-col items-end gap-2">
            <div class="flex items-center gap-4">
              <template v-if="authStore.isAuthenticated">
                <span class="text-slate-600 font-medium">{{ authStore.currentUser?.name || authStore.currentUser?.id }}님</span>
                <button
                  type="button"
                  @click="handleLogout"
                  class="text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  로그아웃
                </button>
              </template>
              <router-link
                v-else
                to="/login"
                class="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                로그인
              </router-link>
            </div>
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
              <Clock :size="18" class="text-slate-500" />
              <span class="text-slate-700 font-medium font-mono">
                {{ formattedTime }}
              </span>
            </div>
            <div class="text-sm text-slate-500">
              {{ formattedDate }}
            </div>
          </div>
        </div>

        <!-- Quick Status Bar -->
        <div class="grid grid-cols-4 gap-6">
          <div
            v-for="(stat, idx) in systemStatus"
            :key="idx"
            class="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              :class="[
                'p-3 rounded-lg',
                stat.status === 'normal' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
              ]"
            >
              <component :is="stat.icon" :size="24" />
            </div>
            <div>
              <div class="text-sm text-slate-500 mb-1">{{ stat.label }}</div>
              <div class="flex items-center gap-2">
                <span class="text-xl font-bold text-slate-800">{{ stat.value }}</span>
                <CheckCircle v-if="stat.status === 'normal'" :size="14" class="text-green-500" />
                <AlertTriangle v-else :size="14" class="text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Menu Grid -->
    <div class="flex-1 max-w-[1800px] mx-auto px-8 py-8 w-full flex flex-col min-h-0">
      <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 shrink-0">
        <LayoutDashboard class="text-slate-400" :size="24" />
        주요 서비스
      </h2>

      <div class="menu-grid gap-6 shrink-0 h-64 mb-6">
        <div
          v-for="(card, idx) in menuCards"
          :key="idx"
          @click="handleNavigate(card.path)"
          class="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
        >
          <!-- Gradient Background on Hover -->
          <div
            :class="[
              'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300',
              card.color
            ]"
          />

          <div class="flex items-start justify-between relative z-10">
            <div class="flex-1">
              <div
                :class="[
                  'inline-flex p-3 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300',
                  card.lightColor
                ]"
              >
                <component :is="card.icon" :size="28" :stroke-width="1.5" />
              </div>
              <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                {{ card.title }}
              </h3>
              <p class="text-slate-500 leading-relaxed max-w-md">
                {{ card.description }}
              </p>
            </div>
            <div class="bg-slate-50 p-3 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <ArrowRight :size="20" class="text-slate-400 group-hover:text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Info Section -->
      <div class="flex-1 grid grid-cols-2 gap-6 min-h-0">
        <!-- Recent Alerts (Simplified) -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
          <div class="flex items-center justify-between mb-4 shrink-0">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle :size="20" class="text-orange-500" />
              최근 시스템 알림
            </h3>
            <button class="text-sm text-slate-400 hover:text-slate-600">더보기</button>
          </div>
          <div class="flex-1 overflow-auto custom-scrollbar space-y-2 pr-2">
            <div
              v-for="i in 6"
              :key="i"
              class="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-pointer"
            >
              <div class="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-slate-800 truncate">분당 센터 영상 서버 #03 응답 지연</div>
                <div class="text-xs text-slate-400 mt-0.5">2024-12-15 14:2{{ i }}</div>
              </div>
              <span class="px-2 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded">확인 필요</span>
            </div>
          </div>
        </div>

        <!-- Notices Section -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
          <div class="flex items-center justify-between mb-4 shrink-0">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
              <Megaphone :size="20" class="text-blue-500" />
              공지사항
            </h3>
            <button class="text-sm text-slate-400 hover:text-slate-600">더보기</button>
          </div>
          <div class="flex-1 overflow-auto custom-scrollbar pr-2">
            <div class="space-y-1">
              <div
                v-for="(notice, i) in notices"
                :key="i"
                class="group flex items-center gap-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-3 rounded-lg transition-colors cursor-pointer"
              >
                <div
                  :class="[
                    'p-2 rounded-lg shrink-0',
                    notice.type === 'notice' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                  ]"
                >
                  <component :is="notice.type === 'notice' ? Megaphone : FileText" :size="16" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                    {{ notice.title }}
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5">{{ notice.date }}</div>
                </div>
                <ChevronRight :size="16" class="text-slate-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { api } from '../../services/api'
import {
  LayoutDashboard,
  Video,
  CheckCircle,
  AlertTriangle,
  Cloud,
  ArrowRight,
  Activity,
  Clock,
  Database,
  Megaphone,
  FileText,
  ChevronRight,
  Server,
  Users
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const currentTime = ref(new Date())

const handleLogout = async () => {
  await authStore.logout(api)
  router.replace('/login')
}

const menuCards = [
  {
    title: '시스템 현황',
    description: '전체 시스템의 상태와 주요 지표를 한눈에 파악합니다.',
    icon: LayoutDashboard,
    path: '/SystemStatusView',
    tab: 'dashboard',
    color: 'from-blue-500 to-indigo-600',
    lightColor: 'bg-blue-50 text-blue-600'
  },
  {
    title: '서버별 현황',
    description: '각 서버의 세부 상태와 리소스 사용량을 모니터링합니다.',
    icon: Activity,
    path: '/ServerStatusView',
    tab: 'server',
    color: 'from-emerald-500 to-teal-600',
    lightColor: 'bg-emerald-50 text-emerald-600'
  },
  {
    title: '영상 보기',
    description: '실시간 CCTV 영상을 그리드 형태로 조회하고 제어합니다.',
    icon: Video,
    path: '/VideoView',
    tab: 'cctv',
    color: 'from-violet-500 to-purple-600',
    lightColor: 'bg-violet-50 text-violet-600'
  },
  {
    title: '장치 관리',
    description: '카메라, 서버 등 장치 정보를 관리하고 설정합니다.',
    icon: Server,
    path: '/DeviceManagementView',
    tab: 'device-manage',
    color: 'from-slate-600 to-slate-800',
    lightColor: 'bg-slate-50 text-slate-600'
  },
  {
    title: '일반 관리',
    description: '사용자 설정 및 시스템 환경을 구성합니다.',
    icon: Users,
    path: '/ManagementView',
    tab: 'general-manage',
    color: 'from-amber-500 to-orange-600',
    lightColor: 'bg-amber-50 text-amber-600'
  }
]

const systemStatus = [
  { label: '카메라 가동률', value: '98.5%', status: 'normal' as const, icon: Video },
  { label: '서버 부하율', value: '42.0%', status: 'normal' as const, icon: Activity },
  { label: '저장소 사용량', value: '76.4%', status: 'warning' as const, icon: Database },
  { label: '네트워크 상태', value: '정상', status: 'normal' as const, icon: Cloud }
]

const notices = [
  { title: '시스템 정기 점검 안내 (12/20)', date: '2024-12-15', type: 'notice' as const },
  { title: '동절기 CCTV 관리 수칙 배포', date: '2024-12-12', type: 'file' as const },
  { title: '보안 패치 적용 완료 (v2.4.1)', date: '2024-12-10', type: 'notice' as const },
  { title: '신규 관제 요원 직무 교육 일정', date: '2024-12-08', type: 'notice' as const },
  { title: '네트워크 장비 교체 작업 예정', date: '2024-12-05', type: 'notice' as const }
]

const formattedTime = computed(() => {
  return currentTime.value.toLocaleTimeString()
})

const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString()
})

const handleNavigate = (path: string) => {
  if (path.startsWith('popup:')) {
    const routeName = path.split(':')[1]
    const routeData = router.resolve({ name: routeName })
    window.open(routeData.href, '_blank', 'width=1920,height=1080')
  } else {
    router.push(path)
  }
}


let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Tailwind CSS 유틸리티 클래스 (Tailwind가 설치되지 않은 경우를 대비) */
.h-screen {
  height: 100vh;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.font-sans {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.overflow-hidden {
  overflow: hidden;
}

.bg-white {
  background-color: #ffffff;
}

.border-b {
  border-bottom-width: 1px;
}

.border-slate-200 {
  border-color: #e2e8f0;
}

.shrink-0 {
  flex-shrink: 0;
}

.max-w-\[1800px\] {
  max-width: 1800px;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.px-8 {
  padding-left: 2rem;
  padding-right: 2rem;
}

.py-6 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.justify-between {
  justify-content: space-between;
}

.items-start {
  align-items: flex-start;
}

.items-center {
  align-items: center;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.h-8 {
  height: 2rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.font-bold {
  font-weight: 700;
}

.text-slate-800 {
  color: #1e293b;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-slate-900 {
  color: #0f172a;
}

.mt-4 {
  margin-top: 1rem;
}

.text-blue-600 {
  color: #2563eb;
}

.text-slate-500 {
  color: #64748b;
}

.mt-2 {
  margin-top: 0.5rem;
}

.text-right {
  text-align: right;
}

.inline-flex {
  display: inline-flex;
}

.gap-2 {
  gap: 0.5rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.bg-slate-100 {
  background-color: #f1f5f9;
}

.rounded-full {
  border-radius: 9999px;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.text-slate-700 {
  color: #334155;
}

.font-medium {
  font-weight: 500;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.grid {
  display: grid;
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.gap-6 {
  gap: 1.5rem;
}

.gap-4 {
  gap: 1rem;
}

.p-4 {
  padding: 1rem;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.border {
  border-width: 1px;
}

.border-slate-100 {
  border-color: #f1f5f9;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.p-3 {
  padding: 0.75rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.text-green-600 {
  color: #16a34a;
}

.bg-orange-50 {
  background-color: #fff7ed;
}

.text-orange-600 {
  color: #ea580c;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-green-500 {
  color: #22c55e;
}

.text-orange-500 {
  color: #f97316;
}

.flex-1 {
  flex: 1 1 0%;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.w-full {
  width: 100%;
}

.min-h-0 {
  min-height: 0;
}

.mb-4 {
  margin-bottom: 1rem;
}

.text-slate-400 {
  color: #94a3b8;
}

.h-64 {
  height: 16rem;
}

.group {
  position: relative;
}

.relative {
  position: relative;
}

.rounded-2xl {
  border-radius: 1rem;
}

.p-6 {
  padding: 1.5rem;
}

.border-slate-200 {
  border-color: #e2e8f0;
}

.hover\:shadow-xl:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-300 {
  transition-duration: 300ms;
}

.cursor-pointer {
  cursor: pointer;
}

.overflow-hidden {
  overflow: hidden;
}

.h-full {
  height: 100%;
}

.absolute {
  position: absolute;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.from-blue-500 {
  --tw-gradient-from: #3b82f6;
  --tw-gradient-to: rgba(59, 130, 246, 0);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-indigo-600 {
  --tw-gradient-to: #4f46e5;
}

.from-emerald-500 {
  --tw-gradient-from: #10b981;
  --tw-gradient-to: rgba(16, 185, 129, 0);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-teal-600 {
  --tw-gradient-to: #0d9488;
}

.from-violet-500 {
  --tw-gradient-from: #8b5cf6;
  --tw-gradient-to: rgba(139, 92, 246, 0);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-purple-600 {
  --tw-gradient-to: #9333ea;
}

.from-slate-600 {
  --tw-gradient-from: #475569;
  --tw-gradient-to: rgba(71, 85, 105, 0);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-slate-800 {
  --tw-gradient-to: #1e293b;
}

.opacity-0 {
  opacity: 0;
}

.group-hover\:opacity-5:hover {
  opacity: 0.05;
}

.transition-opacity {
  transition-property: opacity;
}

.z-10 {
  z-index: 10;
}

.justify-between {
  justify-content: space-between;
}

.inline-flex {
  display: inline-flex;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-emerald-50 {
  background-color: #ecfdf5;
}

.text-emerald-600 {
  color: #059669;
}

.bg-violet-50 {
  background-color: #f5f3ff;
}

.text-violet-600 {
  color: #7c3aed;
}

.bg-slate-50 {
  background-color: #f1f5f9;
}

.group-hover\:scale-110:hover {
  transform: scale(1.1);
}

.transition-transform {
  transition-property: transform;
}

.group-hover\:text-blue-600:hover {
  color: #2563eb;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
}

.leading-relaxed {
  line-height: 1.625;
}

.max-w-md {
  max-width: 28rem;
}

.group-hover\:bg-blue-50:hover {
  background-color: #eff6ff;
}

.group-hover\:text-blue-600:hover {
  color: #2563eb;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-y-1 > * + * {
  margin-top: 0.25rem;
}

.pr-2 {
  padding-right: 0.5rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.last\:border-0:last-child {
  border-width: 0;
}

.hover\:bg-slate-50:hover {
  background-color: #f1f5f9;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.w-2 {
  width: 0.5rem;
}

.h-2 {
  height: 0.5rem;
}

.rounded-full {
  border-radius: 9999px;
}

.bg-orange-500 {
  background-color: #f97316;
}

.min-w-0 {
  min-width: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.mt-0\.5 {
  margin-top: 0.125rem;
}

.bg-orange-50 {
  background-color: #fff7ed;
}

.text-orange-600 {
  color: #ea580c;
}

.rounded {
  border-radius: 0.25rem;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.group-hover\:opacity-100:hover {
  opacity: 1;
}
</style>
