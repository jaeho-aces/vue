# 서버별 현황 / 서버 현황 상세 페이지 구조

서버 모니터링 화면(서버별 현황, 서버 현황 상세)의 라우팅, 데이터 소스, UI 구성, 백엔드 연동을 정리한 문서입니다.

---

## 라우팅

| 경로 | 이름 | 컴포넌트 |
|------|------|-----------|
| `/ServerStatusView` | ServerStatus | `ServerStatusView.vue` |
| `/ServerStatusDetail` | ServerStatusDetail | `ServerStatusDetailView.vue` (쿼리: `type`, `id`) |

상세 페이지 진입: `router.push({ path: '/ServerStatusDetail', query: { type: 'transcoding'|'media', id: serverId } })`

---

## 1. 서버별 현황 (`ServerStatusView.vue`)

**역할:** 등록된 변환/분배·미디어 서버 목록과 현재 지표를 보여주고, 상세로 이동.

### 데이터 소스

- **Store**
  - `useVideoConversionServerInfoStore()` → 변환/분배 서버 목록 (trans_ip, trans_name, alive 등)
  - `useMediaServerInfoStore()` → 미디어 서버 목록 (fms_ip, fms_name, alive 등)
  - `useServerStatusUiStore()` → 탭/뷰 모드 유지 (서버 필터, 그리드/차트)
- **SSE**
  - `prometheusSse.connect(callback)` (ip 없음) → `GET /api/prometheus/stream`
  - 백엔드가 1분마다 DB 전체 IP 기준으로 수집한 `metricsByIp` 수신
  - 콜백에서 `metricsByIp.value = payload` 로 저장

### UI 구성

1. **상단 요약 카드 4개**: 전체 서버 수, 정상 수/비율, 경고 수/비율, 평균 CPU
2. **탭 + 뷰 전환**
   - 탭: 변환/분배 서버 | 미디어 서버
   - 뷰: 그리드(테이블) | 차트(카드)
3. **서버 목록**
   - **그리드**: 테이블 (서버명, IP, 상태, CPU, Memory, Disk, Network, 상세보기)
   - **차트**: 카드 그리드 (서버별 카드에 CPU/Memory/Disk/Network 진행바 + 상세보기)
4. **상세 이동**: `router.push({ path: '/ServerStatusDetail', query: { type, id: serverId } })`

### 지표 매핑

- `effectiveTranscodingServers` / `effectiveMediaServers`: store `items` + `metricsByIp[ip]`로 각 서버의 cpu, memory, disk, network 표시.
- SSE에 해당 IP가 없으면 fallback 값(기본 수치) 사용.

### 생명주기

- **onMounted**: store fetch 후 SSE 연결 (ip 없이).
- **onUnmounted**: SSE 해제.

---

## 2. 서버 현황 상세 (`ServerStatusDetailView.vue`)

**역할:** 한 대 서버의 기본 정보, 현재 instant 지표, 기간별 시계열 차트 표시.

### 진입 조건

- 쿼리: `type` (transcoding | media), `id` (trans_id | fms_id).
- store에서 해당 서버 조회; 없으면 `notFound` → "서버를 찾을 수 없습니다" 표시.

### 데이터 소스

- **Store**
  - `useVideoConversionServerInfoStore()` / `useMediaServerInfoStore()` → `serverId`·`serverType`으로 현재 서버 조회
  - `useCommonCodeStore()` → 미디어 서버 종류명 등
- **SSE**
  - `prometheusSse.connect(callback, serverIp)` → `GET /api/prometheus/stream?ip=...`
  - 백엔드가 해당 IP만 수집해 보낸 `metricsByIp` 수신 → `instantMetrics`에 저장
- **REST**
  - `GET /api/prometheus/range-chart?ip=...&start=...&end=...&step=5m` → CPU/Memory/Disk/Network 시계열
  - 날짜·범위 변경 시 + 1분 주기로 `fetchChartData()` 호출

### UI 구성 (notFound가 아닐 때)

1. **상단**: 뒤로가기(서버별 현황), 페이지 제목
2. **서버 정보 테이블** (3열×2행)
   - 1행: 서버 유형, IP, Port
   - 2행: 상태, 버전/서버종류, 시작시간(변환 서버만)
3. **현재 지표** (SSE, 1분 갱신)
   - CPU / Memory / Disk (%) / Network (MB/s) 한 줄
   - 수신 전이면 "수신 대기 중"
4. **날짜·범위 선택**
   - 날짜 (date), 범위 (1/3/6/12/24시간)
5. **차트 2×2**
   - CPU(%), Memory(%), Disk(%), Network(MB/s) 시계열 `AreaChart` 각 1개

### 생명주기

- **onMounted**: store fetch → `!notFound && serverIp !== '-'`이면 SSE 연결(해당 IP) + `fetchChartData()` + 1분 타이머로 차트 재요청.
- **onUnmounted**: SSE 해제 + 차트 타이머 해제.

---

## 백엔드 연동 요약

| 페이지 | SSE | REST |
|--------|-----|------|
| 서버별 현황 | `/api/prometheus/stream` (ip 없음) → 전체 IP `metricsByIp` | 없음 |
| 서버 현황 상세 | `/api/prometheus/stream?ip=...` → 해당 IP만 `metricsByIp` | `/api/prometheus/range-chart` (차트 시계열) |

- **서버별 현황**에만 있을 때: 백엔드는 DB 전체 IP 기준 1분 폴링 후 전체 전송.
- **서버 현황 상세**만 있을 때: 백엔드는 해당 IP만 1분 폴링 후 해당 IP만 전송.
- 두 페이지가 동시에 열려 있으면(예: 다른 탭): 백엔드는 "전체 IP" 수집 후, 목록 클라이언트에는 전체, 상세 클라이언트에는 해당 IP만 나눠 전송.

---

## 관련 파일

- 프론트: `src/components/views/ServerStatusView.vue`, `ServerStatusDetailView.vue`, `src/services/prometheusSse.ts`, `src/services/prometheus.ts` (타입)
- 라우터: `src/router/index.ts` (ServerStatus, ServerStatusDetail)
- 백엔드: `backend/prometheus.py` (SSE 스트림, range-chart REST)
