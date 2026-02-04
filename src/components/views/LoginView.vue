<template>
  <div class="login-page">
    <div class="login-bg" />
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">
            <img src="/ci.svg" alt="로고" />
            <span>한국도로공사</span>
          </div>
          <h1 class="login-title">CCTV 통합 관제 시스템</h1>
          <p class="login-subtitle">시스템 이용을 위해 로그인해 주세요.</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="field">
            <label for="user_id">사용자 ID</label>
            <input
              id="user_id"
              v-model="userId"
              type="text"
              autocomplete="username"
              required
              placeholder="사용자 ID를 입력하세요"
            />
          </div>
          <div class="field">
            <label for="password">비밀번호</label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              placeholder="비밀번호를 입력하세요"
            />
          </div>
          <button type="submit" class="btn-login" :disabled="loading">
            <span v-if="loading" class="btn-loading" />
            <span>{{ loading ? '로그인 중...' : '로그인' }}</span>
          </button>
        </form>

        <p class="login-footer">계정이 없으시면 시스템 관리자에게 문의해 주세요.</p>
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

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%);
  z-index: 0;
}

.login-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.25), transparent),
    radial-gradient(ellipse 60% 40% at 100% 50%, rgba(99, 102, 241, 0.12), transparent),
    radial-gradient(ellipse 50% 30% at 0% 80%, rgba(59, 130, 246, 0.1), transparent);
  pointer-events: none;
}

.login-wrap {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
}

.login-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.05);
  padding: 2.5rem 2rem;
  backdrop-filter: blur(12px);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.login-logo img {
  height: 2.25rem;
  width: auto;
}

.login-logo span {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
}

.login-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.35rem;
}

.login-subtitle {
  font-size: 0.9rem;
  color: #64748b;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.field label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.5rem;
}

.field input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #0f172a;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field input::placeholder {
  color: #94a3b8;
}

.field input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  background: #fff;
}

.btn-login {
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.875rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
}

.btn-login:hover:not(:disabled) {
  opacity: 0.95;
  transform: translateY(-1px);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-loading {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  margin-top: 1.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
  text-align: center;
  font-size: 0.8rem;
  color: #94a3b8;
}
</style>
