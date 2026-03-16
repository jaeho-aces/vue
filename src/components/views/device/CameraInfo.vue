<template>
  <Table
    ref="tableRef"
    :model-value="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="카메라 정보"
    modal-size="large"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
    id-field="cctv_id"
    :hide-id-column="true"
    preference-key="vms_camera_info"
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  >
    <template #toolbar-actions-left>
      <Button @click="handleServerAssign" variant="info">
        서버 할당
      </Button>
      <Button @click="handleCdnInfoCreate" variant="info">
        CDN 연계 정보 생성
      </Button>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { computed, onMounted, defineComponent, h, ref } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import Button from '../../common/Button.vue'
import { useCameraInfoStore, type Camera } from '../../../stores/cameraInfo'
import { useCommonCodeStore, type CommonCode } from '../../../stores/commonCode'
import { useAlertStore } from '../../../stores/alert'
import { useVideoConversionServerInfoStore } from '../../../stores/videoConversionServerInfo'
import { useMediaServerInfoStore } from '../../../stores/mediaServerInfo'
import { useVideoConversionInfoStore, type VideoConversion } from '../../../stores/videoConversionInfo'

// Pinia 스토어 사용
const cameraStore = useCameraInfoStore()
const commonCodeStore = useCommonCodeStore()
const alertStore = useAlertStore()
const conversionServerStore = useVideoConversionServerInfoStore()
const mediaServerStore = useMediaServerInfoStore()
const videoConversionInfoStore = useVideoConversionInfoStore()

// 본부 옵션 (GRP_GBN='1', GRP_CODE='0')
const headquartersOptions = computed(() => {
  return commonCodeStore.getByGrpGbn('1')
    .filter((item: CommonCode) => String(item.grp_code || '') === '0')
    .map((item: CommonCode) => ({
      value: item.code || '',
      label: (item.code_name || '').trim() || String(item.code || '')
    }))
})

// 지사 옵션: 선택된 본부(hq_code)에 따라 필터 (DataFormModal에서 formData로 호출)
function getBranchOptions(formData: Record<string, any>) {
  const hqCode = formData?.hq_code ?? ''
  return commonCodeStore.getByGrpGbn('2')
    .filter((item: CommonCode) => String(item.grp_code || '') === String(hqCode))
    .map((item: CommonCode) => ({
      value: item.code || '',
      label: (item.code_name || '').trim() || String(item.code || '')
    }))
}

// 노선 옵션 (GRP_GBN='4' 전체)
const routeOptions = computed(() => {
  return commonCodeStore.getByGrpGbn('4').map((item: CommonCode) => ({
    value: item.code || '',
    label: (item.code_name || item.short_code_name || '').trim() || String(item.code || '')
  }))
})

// 변환 서버 / 미디어 서버 옵션 (폼용, DB에 컬럼 없으면 저장 시 제외)
const conversionServerOptions = computed(() =>
  conversionServerStore.items.map((item) => ({
    value: item.trans_id,
    label: `${item.trans_id} (${item.trans_name || ''})`
  }))
)
const mediaServerOptions = computed(() =>
  mediaServerStore.items.map((item) => ({
    value: item.fms_id,
    label: `${item.fms_id} (${item.fms_name || ''})`
  }))
)

const isSubmitting = ref(false) // 중복 요청 방지

// 셀 컴포넌트들
const TextCell = defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    return () => h('span', { class: 'text-sm text-slate-700' }, String(props.value || ''))
  }
})



const YesNoCell = defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    return () => h('span', {
      class: [
        'inline-block px-2 py-0.5 rounded text-xs font-bold',
        props.value === 'Y' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
      ]
    }, String(props.value || ''))
  }
})

const StatusCell = defineComponent({
  props: {
    value: {
      type: [String, Number, Boolean],
      default: ''
    }
  },
  setup(props) {
    const valueStr = String(props.value || '').toLowerCase()
    const isAlive = valueStr === 'y' || valueStr === 'true' || props.value === true

    const statusClass = isAlive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
    const dotClass = isAlive ? 'bg-green-500' : 'bg-slate-400'
    const statusText = isAlive ? '정상' : '중지'

    return () => h('span', {
      class: ['inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', statusClass]
    }, [
      h('span', { class: ['w-1.5 h-1.5 rounded-full', dotClass] }),
      statusText
    ])
  }
})

// 등록일자: YYYY-MM-DD 형식으로만 표시 (timestamp에서 날짜 부분만 추출)
function formatDateOnly(value: string | number | null | undefined): string {
  if (value == null || value === '') return ''
  const s = String(value).trim()
  // "YYYY-MM-DD" 또는 "YYYY-MM-DD HH:mm:ss" 등에서 앞 10자리 사용
  const match = s.match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) return match[1]
  // ISO 형식 T 구분자
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  return s
}

const RegDateCell = defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    return () => h('span', { class: 'text-sm text-slate-700' }, formatDateOnly(props.value))
  }
})

const DateOnlyCell = defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    return () => h('span', { class: 'text-sm text-slate-700' }, formatDateOnly(props.value))
  }
})

// Camera 인터페이스는 stores/cameraInfo.ts에서 import하므로 여기서는 제거

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120

const tableRef = ref<InstanceType<typeof Table> | null>(null)

// 컬럼 정의 (MGMT_CCTV 스키마에 맞춤). 본부/지사/노선은 코드명 표시용 컬럼 사용
const columns: TableColumn[] = [
  { id: 'cctv_id', header: 'ID', size: 140, cellComponent: TextCell },
  { id: 'camera_no', header: '관리 번호', size: 100, cellComponent: TextCell },
  { id: 'hq_name', header: '소속 본부', size: 120, cellComponent: TextCell },
  { id: 'branch_name', header: '소속 지사', size: 120, cellComponent: TextCell },
  { id: 'route_name', header: '노선', size: 120, cellComponent: TextCell },
  { id: 'location', header: '설치 위치', size: 120, cellComponent: TextCell },
  { id: 'camera_area', header: '설치 지역', size: 150, cellComponent: TextCell },
  { id: 'enc_url', header: '인코더 URL', size: 200, cellComponent: TextCell },
  { id: 'trans_wms_port', header: 'WMS 포트', size: 120, cellComponent: TextCell },
  { id: 'link_id_s', header: '링크 시작', size: 100, cellComponent: TextCell },
  { id: 'link_id_e', header: '링크 종료', size: 100, cellComponent: TextCell },
  { id: 'vlink_id_s', header: '가상 링크 시작', size: 110, cellComponent: TextCell },
  { id: 'vlink_id_e', header: '가상 링크 종료', size: 110, cellComponent: TextCell },
  { id: 'road_id', header: '고속도로 ID', size: 100, cellComponent: TextCell },
  { id: 'road_name', header: '고속도로 명', size: 150, cellComponent: TextCell },
  { id: 'milepost', header: '이정', size: 100, cellComponent: TextCell },
  { id: 'bound', header: '설치 방향', size: 100, cellComponent: TextCell },
  { id: 'lat', header: '경도', size: 120, cellComponent: TextCell },
  { id: 'lng', header: '위도', size: 120, cellComponent: TextCell },
  { id: 'fileurl_wmv', header: 'WMV 경로', size: 160, cellComponent: TextCell },
  { id: 'fileurl_mp4', header: 'MP4 경로', size: 180, cellComponent: TextCell },
  { id: 'fileurl_img', header: '정지영상 경로', size: 160, cellComponent: TextCell },
{ id: 'stat', header: '처리 중', size: 90, cellComponent: YesNoCell },
{ id: 'alive', header: '동작 여부', size: 90, cellComponent: StatusCell },
  { id: 'alive_yn', header: 'ALIVE 사용', size: 90, cellComponent: YesNoCell },
  { id: 'update_date', header: '수정 일자', size: 160, cellComponent: DateOnlyCell },
  { id: 'last_cctv_time', header: '마지막 CCTV 시간', size: 160, cellComponent: DateOnlyCell },
  { id: 'hls_url', header: 'HLS URL', size: 200, cellComponent: TextCell },
  { id: 'hls_alive', header: 'HLS 동작', size: 90, cellComponent: YesNoCell },
  { id: 'hls_duration', header: 'HLS 지속(초)', size: 100, cellComponent: TextCell },
  { id: 'hls_emergency', header: '응급 URL', size: 90, cellComponent: YesNoCell },
  { id: 'ftp_sent_date', header: 'FTP 전송 시간', size: 160, cellComponent: DateOnlyCell },
  { id: 'reg_date', header: '등록 일자', size: 120, cellComponent: RegDateCell }
]

// 기본 표시 컬럼 (ID·카메라 ID 컬럼 숨김, 본부/지사/노선은 코드명 컬럼 사용)
const defaultVisibleColumns = [
  'camera_no', 'hq_name', 'branch_name', 'route_name', 'location', 'road_name', 'alive', 'reg_date'
]

// 스토어 데이터에 공통코드 코드명 + 영상 변환 정보(변환/미디어 서버)를 붙여 테이블·수정 모달에 사용
const rawData = computed(() => {
  const getCodeName = commonCodeStore.getCodeName
  const getCodeNameByGbn = commonCodeStore.getCodeNameByGbn
  const conversionItems = videoConversionInfoStore.items
  return cameraStore.items.map((c: Camera) => {
    const conv = conversionItems.find(
      (v: any) => String(v.cctv_id || '').trim() === String(c.cctv_id || '').trim()
    )
    return {
      ...c,
      hq_name: getCodeName('1', '0', c.hq_code || '') || c.hq_code,
      branch_name: getCodeName('2', c.hq_code || '', c.branch_code || '') || c.branch_code,
      route_name: getCodeNameByGbn('4', c.route_code || '') || c.route_code,
      trans_id: conv?.trans_id ?? '',
      fms_id: conv?.fms_id ?? ''
    }
  })
})

// 폼 필드 정의: 명세 순서. 카메라 ID(cctv_id) → 소속 본부 → 소속 지사 → 노선 → 고속도로 이름 → 고속도로 ID → 이정 → 설치 지역 → Encoder URL → WMS Port → 링크 시작/종료 → 설치 방향 → 경도/위도 → HLS URL → 공인 URL → 스트림 용도 → 변환/파일제공/미디어 서버.
const formFields = computed<FormField[]>(() => [
  { id: 'cctv_id', label: '카메라 ID', type: 'text', required: true, placeholder: 'cctv0000XXXX', maxLength: 12, readonlyInEdit: true },
  { id: 'hq_code', label: '소속 본부', type: 'select', required: true, placeholder: '본부 선택', options: headquartersOptions.value },
  {
    id: 'branch_code',
    label: '소속 지사',
    type: 'select',
    required: true,
    placeholder: '소속 본부 선택 후 선택 가능',
    options: getBranchOptions,
    disabled: (formData) => (formData?.hq_code ?? '') === ''
  },
  { id: 'route_code', label: '노선', type: 'select', required: true, placeholder: '노선 선택', options: routeOptions.value },
  { id: 'road_name', label: '고속도로 이름', type: 'text', placeholder: '' },
  { id: 'road_id', label: '고속도로 ID', type: 'text', placeholder: '' },
  {
    id: 'enc_url',
    label: 'Encoder URL',
    type: 'text',
    required: true,
    placeholder: 'rtsp://<분배서버-IP>/<카메라-IP>:ch<채널>:<해상도>'
  },
  {
    id: 'hls_url',
    label: 'HLS URL',
    type: 'text',
    required: true,
    placeholder: 'http://live1.cdn.com/cctv1/playlist.m3u8'
  },
  {
    id: 'public_url',
    label: '공인 URL',
    type: 'text',
    placeholder: 'rtmp://... 또는 rtsp://...'
  },
  {
    id: 'trans_id',
    label: '변환 서버',
    type: 'select',
    required: true,
    placeholder: '영상 변환 서버 선택',
    options: conversionServerOptions.value
  },
  {
    id: 'fms_id',
    label: '미디어 서버',
    type: 'select',
    required: true,
    placeholder: '미디어 서버 선택',
    options: mediaServerOptions.value
  },
  {
    id: 'stream_purpose',
    label: '스트림 용도 구분',
    type: 'select',
    placeholder: '미디어 서버 선택 후 선택 가능',
    disabled: (formData) => (formData?.fms_id ?? '') === '',
    options: [
      { value: 'Live', label: 'Live' },
      { value: 'VoD', label: 'VoD' }
    ]
  },
  { id: 'milepost', label: '이정', type: 'text', required: true, placeholder: '120.00' },
  { id: 'camera_area', label: '설치 지역', type: 'text', required: true, placeholder: '' },
  { id: 'trans_wms_port', label: 'WMS Port', type: 'number', placeholder: '숫자 최대 5자리', maxLength: 5, max: 99999 },
  { id: 'link_id_s', label: '링크 시작점', type: 'text', placeholder: '표준 노드 링크 시작' },
  { id: 'link_id_e', label: '링크 종료점', type: 'text', placeholder: '표준 노드 링크 종료' },
  { id: 'bound', label: '설치 방향', type: 'text', placeholder: '설치 방향' },
  { id: 'lng', label: '경도 좌표', type: 'text', placeholder: '', pattern: '^-?\\d*\\.?\\d*$', patternMessage: '숫자만 입력 가능합니다.' },
  { id: 'lat', label: '위도 좌표', type: 'text', placeholder: '', pattern: '^-?\\d*\\.?\\d*$', patternMessage: '숫자만 입력 가능합니다.' }
])

// Camera 인터페이스에 있는 키만 추출 (폼 전용 필드 public_url, stream_purpose, trans_id, fms_id는 API에 미포함)
const CAMERA_KEYS: (keyof Camera)[] = [
  'cctv_id', 'camera_no', 'hq_code', 'branch_code', 'route_code', 'location', 'camera_area',
  'enc_url', 'trans_wms_port', 'link_id_s', 'link_id_e', 'vlink_id_s', 'vlink_id_e', 'road_id',
  'road_name', 'milepost', 'bound', 'lat', 'lng', 'fileurl_wmv', 'fileurl_mp4', 'fileurl_img',
  'stat', 'alive', 'alive_yn', 'update_date', 'last_cctv_time', 'hls_url', 'hls_alive',
  'hls_duration', 'hls_emergency', 'ftp_sent_date', 'reg_date'
]
function toCameraPayload(data: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const key of CAMERA_KEYS) {
    if (Object.prototype.hasOwnProperty.call(data, key)) out[key] = data[key]
  }
  return out
}

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  if (isSubmitting.value || cameraStore.isLoading) return
  try {
    isSubmitting.value = true
    // 수정 시 폼에 없는 필드(alive, alive_yn, location 등)는 기존 행 값 유지
    const merged = isNew ? data : (() => {
      const existing = cameraStore.items.find((c: Camera) => c.cctv_id === data.cctv_id)
      return existing ? { ...existing, ...data } : data
    })()
    const payload = toCameraPayload(merged)
    if (isNew) {
      // 신규: 카메라 ID(CCTV0000XXXX 형식, 문자열 12자리) → cctv_id 전체, 관리번호(camera_no)는 마지막 XXXX만 저장
      const cctvId = String(payload.cctv_id ?? '').trim().slice(0, 12)
      payload.cctv_id = cctvId
      payload.camera_no = cctvId.slice(-4)
      const now = new Date()
      const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      payload.reg_date = nowStr
      payload.stat = (payload.stat ?? 'n').toString().toLowerCase()
      payload.alive = (payload.alive ?? 'n').toString().toLowerCase()
      payload.hls_alive = (payload.hls_alive ?? 'n').toString().toLowerCase()
      payload.alive_yn = (payload.alive_yn ?? 'n').toString().toLowerCase()
      payload.hls_duration = payload.hls_duration ?? '0'
      payload.update_date = payload.update_date ?? nowStr
      payload.last_cctv_time = payload.last_cctv_time ?? nowStr
      payload.ftp_sent_date = payload.ftp_sent_date ?? nowStr
      await cameraStore.createCamera(payload as Camera)

      // 신규 카메라 등록 성공 후 MGMT_CHANNEL에 채널 등록 (ch_id = CCTV → CH). DB 컬럼 길이 제한 준수
      const rawChId = (String(payload.cctv_id || '')).replace(/^CCTV/i, 'CH')
      const channelPayload = {
        ch_id: rawChId.slice(0, 10),
        cctv_id: String(payload.cctv_id ?? '').slice(0, 12),
        trans_id: String(merged.trans_id ?? '').slice(0, 10),
        fms_id: String(merged.fms_id ?? '').slice(0, 11),
        ch_venc: 'h264',
        ch_vsize: '3',
        ch_vfps: '',
        ch_vkpbs: '',
        ch_alive: 'y',
        ch_alive_time: null as string | null,
        ch_alive_yn: 'y',
        reg_date: nowStr,
        json_job: 'n',
        json_yn: 'n',
        json_date: nowStr,
        kt_cctv: '',
        ch_wmv_yn: 'n',
        ch_wmv_venc: '4',
        ch_wmv_vsize: '',
        ch_wmv_vfps: '',
        ch_wmv_vkpbs: '',
        sms_session: '',
        sms_host_ip: '',
        sms_date: null as string | null,
        job_status: '',
        ch_jpg_size: '3',
        ch_jpg_kbps: '',
        ch_jpg_keep_count: 0
      }
      try {
        await videoConversionInfoStore.createVideoConversion(channelPayload as VideoConversion)
      } catch (channelError: any) {
        const channelDetail = channelError.response?.data?.detail || videoConversionInfoStore.error || ''
        const channelDetailText = typeof channelDetail === 'string'
          ? channelDetail
          : Array.isArray(channelDetail)
            ? channelDetail.map((d: any) => d?.msg ?? d).join(', ')
            : (channelDetail?.message ?? '')
        alertStore.show(
          `채널 정보 등록에 실패했습니다. 영상 변환 정보 화면에서 수동으로 등록할 수 있습니다.${channelDetailText ? ` (${channelDetailText})` : ''}`,
          'error'
        )
      }
    } else {
      await cameraStore.updateCamera(payload.cctv_id, payload)
    }
    await cameraStore.fetchCameras(true)
    alertStore.show(isNew ? '신규 생성 완료' : '수정 완료', 'success')
    tableRef.value?.closeModal?.()
  } catch (error: any) {
    const detail = error.response?.data?.detail || cameraStore.error || ''
    const detailText = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((d: any) => d?.msg ?? d).join(', ')
        : (detail?.message ?? '')
    const lower = detailText.toLowerCase()
    const isDuplicate = lower.includes('duplicate')
      || lower.includes('already exists')
      || lower.includes('conditionalcheckfailed')
      || lower.includes('key must have')
      || lower.includes('unique')
      || detailText.includes('고유 제약')
      || detailText.includes('키가 이미 있습니다')
      || detailText.includes('이미 있습니다')
    const errorMessage = isDuplicate
      ? '이미 존재하는 카메라 ID입니다. 다른 값을 입력해주세요.'
      : (detailText || '데이터 저장 중 오류가 발생했습니다.')
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 카메라 cctv_id → 영상 변환 채널 ch_id (생성 시와 동일 규칙: CCTV→CH, 최대 10자)
function cctvIdToChId(cctvId: string): string {
  const raw = (cctvId || '').replace(/^CCTV/i, 'CH')
  return raw.slice(0, 10)
}

// 데이터 삭제 처리: 연계된 채널 정보를 먼저 삭제한 뒤 카메라 삭제
const handleDataDelete = async (ids: string[]) => {
  if (isSubmitting.value || cameraStore.isLoading) return
  try {
    isSubmitting.value = true
    // 연계 채널 ch_id 수집: store에 있으면 실제 ch_id 사용, 없으면 cctv_id→ch_id 변환 (생성 규칙과 동일)
    const chIds: string[] = []
    for (const cctvId of ids) {
      const channel = videoConversionInfoStore.getByCctvId(cctvId)
      if (channel?.ch_id) {
        chIds.push(channel.ch_id)
      } else {
        chIds.push(cctvIdToChId(cctvId))
      }
    }
    const uniqueChIds = [...new Set(chIds)]
    if (uniqueChIds.length > 0) {
      try {
        await videoConversionInfoStore.deleteVideoConversions(uniqueChIds)
      } catch (channelErr: any) {
        alertStore.show('연계 채널 삭제 중 오류가 발생했습니다. 카메라만 삭제합니다.', 'warning')
      }
    }
    await cameraStore.deleteCameras(ids)
    await cameraStore.fetchCameras(true)
    alertStore.show('삭제 완료', 'success')
  } catch (error: any) {
    const errorMessage = cameraStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 컴포넌트 마운트 시 데이터 및 공통코드·서버 목록·영상 변환 정보 로드 (수정 모달에서 변환/미디어 서버 값 채우기 위해)
onMounted(() => {
  cameraStore.fetchCameras()
  commonCodeStore.fetchCommonCodes()
  conversionServerStore.fetchVideoConversionServers()
  mediaServerStore.fetchMediaServers()
  videoConversionInfoStore.fetchVideoConversions()
})

// 서버 할당 버튼 핸들러
const handleServerAssign = () => {
  // TODO: 서버 할당 로직 구현
}

// CDN 연계 정보 생성 버튼 핸들러
const handleCdnInfoCreate = () => {
  // TODO: CDN 연계 정보 생성 로직 구현
}
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>
