<template>
  <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
    <div class="absolute inset-0 z-0 login-bg-gradient" />
    <div class="relative z-10 w-full max-w-[420px]">
      <div class="login-card-glass rounded-3xl py-10 px-8">
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 mb-5">
            <img src="/ci.svg" alt="로고" class="h-9 w-auto" />
            <span class="text-[1.35rem] font-bold text-slate-900">한국도로공사</span>
          </div>
          <h1 class="text-xl font-semibold text-slate-700 mb-[0.35rem]">CCTV 통합 관제 시스템</h1>
          <p class="text-[0.9rem] text-slate-500">시스템 이용을 위해 로그인해 주세요.</p>
        </div>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-[1.35rem]">
          <div>
            <label for="user_id" class="block text-sm font-medium text-slate-600 mb-2">사용자 ID</label>
            <input
              id="user_id"
              v-model="userId"
              type="text"
              autocomplete="username"
              required
              placeholder="사용자 ID를 입력하세요"
              class="w-full px-4 py-3 text-base leading-6 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] focus:bg-white"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-slate-600 mb-2">비밀번호</label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              placeholder="비밀번호를 입력하세요"
              class="w-full px-4 py-3 text-base leading-6 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] focus:bg-white"
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="mt-2 w-full py-3.5 px-5 text-base font-semibold text-white btn-login-gradient border-0 rounded-xl cursor-pointer transition-[opacity,transform] duration-[0.2s,0.15s] relative flex items-center justify-center min-h-[2.75rem] hover:opacity-95 hover:-translate-y-px active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="btn-loading-spinner" />
            <span>{{ loading ? '로그인 중...' : '로그인' }}</span>
          </button>
        </form>

        <p class="mt-7 pt-6 border-t border-slate-100 text-center text-[0.8rem] text-slate-400">계정이 없으시면 시스템 관리자에게 문의해 주세요.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { useAlertStore } from '../../stores/alert'
import { sha256Hex } from '../../utils/crypto'

const router = useRouter()
const alertStore = useAlertStore()
const authStore = useAuthStore()

const userId = ref('')
const password = ref('')
const loading = ref(false)

/** 서버/네트워크 오류 메시지를 사용자 친화 문구로 변환 */
function getLoginErrorMessage(err: any): string {
  const status = err.response?.status
  const detail = err.response?.data?.detail
  const detailStr = typeof detail === 'string' ? detail : Array.isArray(detail) ? (detail[0]?.msg ?? '') : ''

  if (status === 401) {
    return '사용자 ID 또는 비밀번호가 올바르지 않습니다.'
  }
  if (status === 400) {
    if (/nonce|NONCE/i.test(detailStr)) return '보안 인증이 만료되었습니다. 페이지를 새로고침한 뒤 다시 로그인해 주세요.'
    if (/user_id|password|required/i.test(detailStr)) return '사용자 ID와 비밀번호를 모두 입력해 주세요.'
    return detailStr || '입력 내용을 확인해 주세요.'
  }
  if (status === 404) {
    return '로그인 서비스를 찾을 수 없습니다. 서버 설정을 확인하거나 잠시 후 다시 시도해 주세요.'
  }
  if (status === 503 || status === 502) {
    return '일시적으로 로그인할 수 없습니다. 잠시 후 다시 시도해 주세요.'
  }
  if (status >= 500) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  }
  if (err.message === 'Network Error' || !status) {
    return '서버에 연결할 수 없습니다. 네트워크와 서버 상태를 확인해 주세요.'
  }
  return detailStr || '로그인에 실패했습니다. 다시 시도해 주세요.'
}

const handleLogin = async () => {
  const uid = userId.value.trim()
  const pwd = password.value
  if (!uid || !pwd) {
    alertStore.show('사용자 ID와 비밀번호를 입력하세요.', 'warning')
    return
  }
  loading.value = true
  try {
    const nonceRes = await api.get<{ nonce: string }>('/api/auth/nonce')
    const nonce = nonceRes.data?.nonce
    if (!nonce) {
      alertStore.show('보안 토큰을 받지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.', 'error')
      return
    }
    const passwordHash = await sha256Hex(pwd)
    const res = await api.post<{ user: { id: string; name: string; email: string } }>(
      '/api/auth/login',
      { user_id: uid, password: passwordHash, nonce }
    )
    const user = res.data.user
    authStore.login({ id: user.id, name: user.name, email: user.email || '' })
    router.push('/')
  } catch (err: any) {
    alertStore.show(getLoginErrorMessage(err), 'error')
  } finally {
    loading.value = false
  }
}
</script>
