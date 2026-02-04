# 로그인 및 사용자 관리 문서

이 문서는 CCTV 통합 관제 시스템의 **로그인 과정**과 **사용자 계정 생성/수정 과정**을 설명합니다.

---

## 1. 보안 구조 개요

- **비밀번호 전송**: 평문을 서버로 보내지 않습니다. 클라이언트에서 **SHA-256**으로 해시한 hex 문자열만 전송합니다.
- **저장값**: 서버에서는 **bcrypt(클라이언트에서 받은 SHA-256 해시)** 를 DB에 저장합니다. 로그인 시에는 동일하게 `sha256(password)`를 보내고, 서버에서 `verify_password(받은 해시, DB에 저장된 bcrypt)`로 검증합니다.
- **넌스(Nonce)**: 비밀번호가 포함된 요청(POST/PUT 로그인·사용자 생성·수정) 시 **재전송 공격 방지**를 위해 사용합니다. 서버가 넌스를 발급하고, 클라이언트가 해당 넌스를 요청 본문에 포함해 보내면 서버가 한 번만 사용 가능하도록 검증 후 폐기합니다.
- **세션 토큰**: 로그인 성공 시 서버가 **httpOnly 쿠키**로 토큰을 설정합니다. 클라이언트는 토큰을 저장하지 않으며, XSS로부터 토큰 탈취 위험을 줄입니다. 모든 API 요청 시 `withCredentials: true`로 쿠키가 자동 전송됩니다.

---

## 2. 로그인 과정

### 2.1 흐름 요약

1. 사용자가 로그인 페이지(`/login`)에서 사용자 ID와 비밀번호 입력
2. 클라이언트가 **넌스 발급** API 호출 → 서버가 넌스 반환 및 캐시 저장
3. 클라이언트가 비밀번호를 **SHA-256 해시(hex)** 로 변환
4. 클라이언트가 **로그인 API**에 `user_id`, `password(해시)`, `nonce` 전송 (`withCredentials: true`로 쿠키 수신 가능)
5. 서버가 넌스 검증 후 DB에서 사용자 조회, bcrypt로 비밀번호 검증
6. 성공 시 서버가 **Set-Cookie**로 httpOnly 쿠키(세션 토큰) 설정, 응답 본문에 **user** 만 반환 → 클라이언트가 auth 스토어에 `user`만 저장 후 홈(`/`)으로 이동
7. 새로고침 시 라우터 가드에서 **GET /api/auth/me** 호출(쿠키 자동 전송) → 서버가 쿠키의 토큰으로 사용자 조회 후 `user` 반환 → 스토어 복원
8. 로그인하지 않은 상태에서는 **로그인 페이지 외 다른 페이지 접근 불가** (라우터 가드)
9. **로그아웃** 시 **POST /api/auth/logout** 호출로 서버가 쿠키 삭제, 이후 스토어 초기화 후 로그인 페이지로 이동

### 2.2 프론트엔드

1. 로그인 화면 (`src/components/views/LoginView.vue`)
   - 사용자 ID/비밀번호 입력, 넌스 조회 → SHA-256 → 로그인 API 호출. 성공 시 응답에 **Set-Cookie**로 토큰 설정되며 본문은 `{ user }` → `authStore.login(user)` 후 `/` 이동

2. 인증 상태 (`src/stores/auth.ts`)
   - **토큰은 스토어에 두지 않음.** `user`, `authReady`만 관리. `login(user)`, `logout(api?)`, `fetchUser(api)` (GET /api/auth/me로 쿠키 검증 후 user 복원)

3. 라우터 가드 (`src/router/index.ts`)
   - `beforeEach`에서 `authReady`가 false면 `fetchUser(api)`로 **GET /api/auth/me** 호출 후 로그인 여부 판단. 비로그인 시 `/login`, 로그인 페이지 접속 시 이미 로그인되어 있으면 `/`로 리다이렉트

4. API 클라이언트 (`src/services/api.ts`)
   - `apiClient` / `fastApiClient` 모두 **withCredentials: true** 로 설정해 쿠키를 요청에 포함·응답에서 저장

5. 해시 유틸 (`src/utils/crypto.ts`)
   - `sha256Hex(plain)` — Web Crypto API로 SHA-256 후 hex 문자열 반환

**로그인 API 호출 예시 (LoginView.vue)**

```ts
const res = await api.post<{ user: { id: string; name: string; email: string } }>(
  '/api/auth/login',
  { user_id: uid, password: passwordHash, nonce }
)
authStore.login(res.data.user)  // 토큰은 쿠키로 설정됨, 스토어에는 user만
router.push('/')
```

### 2.3 백엔드

1. 인증 로직 (`backend/auth.py`)
 - 넌스 캐시, `hash_password`/`verify_password`(bcrypt), `process_mgmt_user_password_body`, 로그인/넌스 라우트

2. 라우트 등록 (`backend/main.py`)
 - `register_auth_routes(app)` 호출

**API**

- `GET /api/auth/nonce` (또는 `GET /auth/nonce`)  
  - 응답: `{ "nonce": "64자 hex" }`  
  - 넌스를 메모리 캐시에 TTL(60초)로 저장

- `POST /api/auth/login` (또는 `POST /auth/login`)  
  - Body: `{ "user_id": "...", "password": "sha256 hex", "nonce": "..." }`  
  - 넌스 검증 → MGMT_USER에서 `user_id`로 조회 → `verify_password(받은 해시, DB 저장값)`  
  - 성공 시: **Set-Cookie**로 `session_token`(httpOnly, SameSite=Lax, 7일) 설정, 응답 본문: `{ "user": { "id", "name", "email" } }` (토큰은 본문에 포함하지 않음)  
  - 실패 시: 400(넌스/필수값), 401(아이디·비밀번호 오류), 404/503 등

- `GET /api/auth/me` (또는 `GET /auth/me`)  
  - 쿠키의 `session_token`으로 서버 메모리(`_login_tokens`)에서 user_id 조회 후 DB에서 사용자 정보 반환.  
  - 응답: `{ "user": { "id", "name", "email" } }`. 쿠키 없거나 무효 시 401.

- `POST /api/auth/logout` (또는 `POST /auth/logout`)  
  - 쿠키의 토큰을 메모리에서 제거하고 **Set-Cookie**로 `session_token` 삭제. 응답: `{ "ok": true }`.

토큰은 서버 **메모리**(`_login_tokens`)에 보관됩니다. 추후 Redis 등으로 교체 가능합니다. 운영 시 쿠키에 `Secure`를 걸려면 환경 변수 `AUTH_COOKIE_SECURE=true`로 설정합니다.

### 2.4 로그아웃

- **HomeView.vue**: 로그아웃 버튼 클릭 시 `await authStore.logout(api)` 호출 → 서버 **POST /api/auth/logout**으로 쿠키 삭제 후 스토어 `user` 초기화, 이어서 `router.replace('/login')`.
- **auth 스토어**: `logout(api?)` — api 전달 시 서버 로그아웃 호출 후 `user` 초기화. 401 응답 등으로 스토어만 초기화할 때는 `logout()` 인자 없이 호출.

---

## 3. 사용자 생성/수정 과정 (MGMT_USER)

관리 화면에서 **사용자 계정**을 신규 생성하거나 수정할 때, 비밀번호가 포함되면 넌스와 클라이언트 SHA-256을 사용합니다.

### 3.1 흐름 요약

**신규 사용자 생성**

1. 사용자가 사용자 ID, 이름, **비밀번호** 등 입력 후 저장
2. 비밀번호 미입력 시: "신규 사용자는 암호를 입력해야 합니다." 알림 후 중단
3. `GET /api/auth/nonce` 로 넌스 발급
4. 비밀번호를 `sha256Hex(비밀번호)` 로 해시
5. `POST /api/rest-access-page/MGMT_USER` 로 전송. Body에 `PASSWORD`(해시), `NONCE`(넌스) 포함
6. 서버에서 넌스 검증 후 `PASSWORD`를 bcrypt로 해시해 DB에 저장, body에서 `NONCE` 제거 후 INSERT

**기존 사용자 수정**

- **비밀번호를 바꾸는 경우**: 넌스 발급 → SHA-256 해시 → `PASSWORD`, `NONCE` 포함해 `PUT /api/rest-access-page/MGMT_USER` 호출. 서버에서 넌스 검증, bcrypt 해시, nonce 제거 후 UPDATE.
- **비밀번호를 바꾸지 않는 경우**: 넌스 요청/전송 없이 `PASSWORD`/`NONCE` 없이 PUT만 수행.

### 3.2 프론트엔드

1. 사용자 계정 화면(`src/components/views/general/UserAccount.vue`)
 - 테이블 + 폼 모달. `handleDataUpdate`에서 신규/수정 시 비밀번호 있으면 넌스 조회 + `sha256Hex` 후 `PASSWORD`, `NONCE` 설정하여 POST 또는 PUT

**UserAccount.vue 요약**

- 신규: `data.password` 없으면 경고 후 return. 있으면 넌스 조회 → `mgmtUserData.PASSWORD = await sha256Hex(data.password.trim())`, `mgmtUserData.NONCE = nonce` → POST.
- 수정: `data.password`가 있으면 동일하게 넌스 + SHA-256 후 body에 `PASSWORD`, `NONCE` 포함해 PUT. 없으면 그대로 PUT.

### 3.3 백엔드

| 구분 | 파일 | 설명 |
|------|------|------|
1. REST 라우트 (`backend/database.py`)
 - `rest_access_post`, `rest_access_put` 등록. MGMT_USER일 때 `process_mgmt_user_password_body` 호출

2. 비밀번호 처리 (`backend/auth.py`)
 - `process_mgmt_user_password_body(body, table_name)` — MGMT_USER이고 body에 `password` 키가 있으면 넌스 검증, `hash_password`로 치환, body에서 `nonce` 키 제거

**process_mgmt_user_password_body 동작**

- `table_name`이 `MGMT_USER`가 아니거나, body에 `password`(대소문자 무시)가 없으면 아무 작업도 하지 않음.
- 그 외: body에서 `nonce`/`NONCE` 추출 → 없으면 400 "NONCE required for password" → `consume_nonce(nonce)` 실패 시 400 "Invalid or expired nonce" → body의 password 값을 `hash_password(값)`으로 치환 → body에서 `nonce` 키 삭제.

DB에는 **bcrypt 해시 문자열**만 저장됩니다. 컬럼은 기존 `PASSWORD`(varchar 256 등)를 그대로 사용합니다.

---

## 4. 관련 파일 목록

1. 로그인 페이지 - `src/components/views/LoginView.vue`
2. 사용자 계정 관리(생성/수정) - `src/components/views/general/UserAccount.vue`
3. 인증 스토어 - `src/stores/auth.ts`
4. 라우터(가드 포함) - `src/router/index.ts`
5. SHA-256 유틸 - `src/utils/crypto.ts`
6. 인증 API·넌스·bcrypt - `backend/auth.py`
7. REST POST/PUT(MGMT_USER) - `backend/database.py`
8. 앱 진입점·auth 라우트 등록 - `backend/main.py`

---

## 5. 참고 사항

- **HTTPS**: 운영 환경에서는 반드시 HTTPS 사용을 권장합니다. 넌스와 클라이언트 해시는 전송 구간 보안을 대체하지 않습니다.
- **httpOnly 쿠키**: 토큰은 응답 헤더 Set-Cookie로만 전달되며, JavaScript에서 읽을 수 없어 XSS로 토큰 탈취 위험을 줄입니다. 쿠키 유효 기간은 7일(`AUTH_COOKIE_MAX_AGE`). 운영 시 `AUTH_COOKIE_SECURE=true`로 설정해 HTTPS에서만 쿠키 전송을 권장합니다.
- **세션 복원**: 새로고침 시 라우터 가드에서 GET /api/auth/me가 쿠키를 보내고, 서버가 유효한 토큰이면 사용자 정보를 반환해 스토어에 복원합니다.
- **토큰 저장소**: 현재 서버는 토큰을 메모리(`_login_tokens`)에만 보관합니다. 서버 재시작 시 모든 세션이 무효화됩니다. 장기 세션·다중 인스턴스 대응이 필요하면 Redis 등으로 교체할 수 있습니다.
- **bcrypt 제한**: bcrypt는 입력 최대 72바이트. `auth.py`의 `_truncate_for_bcrypt`로 72바이트 초과 시 잘라서 처리합니다. 클라이언트 SHA-256 hex(64자)는 그대로 저장·검증됩니다.
