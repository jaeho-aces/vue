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

      <div class="grid grid-cols-5 gap-6 shrink-0 h-64 mb-6">
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
