<template>
  <Table
    :model-value="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="카메라 정보"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
    id-field="cctv_id"
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

// Pinia 스토어 사용
const cameraStore = useCameraInfoStore()
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

const LiveCell = defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    return () => h('div', { class: 'text-center' }, [
      h('span', {
        class: [
          'inline-block w-2 h-2 rounded-full',
          props.value === 'Y' ? 'bg-red-500 animate-pulse' : 'bg-slate-300'
        ]
      })
    ])
  }
})

const StatusCell = defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    const statusClass = props.value === 'active' ? 'bg-green-50 text-green-700' :
                       props.value === 'warning' ? 'bg-orange-50 text-orange-700' :
                       'bg-slate-100 text-slate-600'
    const dotClass = props.value === 'active' ? 'bg-green-500' :
                     props.value === 'warning' ? 'bg-orange-500' :
                     'bg-slate-400'
    
    return () => h('span', {
      class: ['inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', statusClass]
    }, [
      h('span', { class: ['w-1.5 h-1.5 rounded-full', dotClass] }),
      String(props.value || '').toUpperCase()
    ])
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

// Camera 인터페이스는 stores/cameraInfo.ts에서 import하므로 여기서는 제거

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120
const columnWidths = [110, 110, 120, 80, 110, 90, 110, 120, 120, 150, 150, 150, 120, 110, 90, 90, 90, 90, 90, 150, 150, 150, 120, 120]

// 컬럼 정의 (실제 DB 스키마에 맞춤)
const columns: TableColumn[] = [
  { id: 'camera_no', header: '카메라 관리 번호', size: 120, cellComponent: TextCell },
  { id: 'hq_code', header: '본부 코드', size: 100, cellComponent: TextCell },
  { id: 'branch_code', header: '지사 코드', size: 100, cellComponent: TextCell },
  { id: 'route_code', header: '노선 코드', size: 100, cellComponent: TextCell },
  { id: 'location', header: '설치 위치', size: 120, cellComponent: TextCell },
  { id: 'camera_area', header: '설치 지역', size: 120, cellComponent: TextCell },
  { id: 'enc_url', header: '인코더 URL', size: 200, cellComponent: TextCell },
  { id: 'trans_wms_port', header: '변환 서버 WMS 포트', size: 150, cellComponent: TextCell },
  { id: 'link_id_s', header: '표준 노드 링크 시작점', size: 150, cellComponent: TextCell },
  { id: 'link_id_e', header: '표준 노드 링크 종료점', size: 150, cellComponent: TextCell },
  { id: 'vlink_id_s', header: 'VLINK_ID_S', size: 120, cellComponent: TextCell },
  { id: 'vlink_id_e', header: 'VLINK_ID_E', size: 120, cellComponent: TextCell },
  { id: 'road_id', header: '설치 고속도로 ID', size: 120, cellComponent: TextCell },
  { id: 'road_name', header: '설치 고속도로 이름', size: 150, cellComponent: TextCell },
  { id: 'milepost', header: '이정', size: 100, cellComponent: TextCell },
  { id: 'bound', header: '설치 방향', size: 100, cellComponent: TextCell },
  { id: 'lat', header: '경도 좌표', size: 120, cellComponent: TextCell },
  { id: 'lng', header: '위도 좌표', size: 120, cellComponent: TextCell },
  { id: 'fileurl_wmv', header: 'WMV 파일 저장 경로', size: 200, cellComponent: TextCell },
  { id: 'fileurl_mp4', header: 'MP4 파일 저장 경로', size: 200, cellComponent: TextCell },
  { id: 'fileurl_img', header: '정지 영상 저장 경로', size: 200, cellComponent: TextCell },
  { id: 'stat', header: '처리 중 표식', size: 100, cellComponent: TextCell },
  { id: 'alive', header: '동작 중인지 표시', size: 120, cellComponent: LiveCell },
  { id: 'alive_yn', header: 'ALIVE 사용 여부', size: 120, cellComponent: YesNoCell },
  { id: 'update_date', header: '수정 일자', size: 120, cellComponent: TextCell },
  { id: 'last_cctv_time', header: '마지막 CCTV 동작 시간', size: 150, cellComponent: TextCell },
  { id: 'hls_url', header: 'HLS URL', size: 200, cellComponent: TextCell },
  { id: 'hls_alive', header: 'HLS 동작 여부', size: 120, cellComponent: YesNoCell },
  { id: 'hls_duration', header: 'HLS 개별 파일별 지속 시간', size: 180, cellComponent: TextCell },
  { id: 'hls_emergency', header: '응급 URL 여부', size: 120, cellComponent: YesNoCell },
  { id: 'ftp_sent_date', header: 'FTP 전송 시간', size: 150, cellComponent: TextCell },
  { id: 'reg_date', header: '등록 일자', size: 120, cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['camera_no', 'hq_code', 'branch_code', 'route_code', 'location', 'road_name', 'alive', 'reg_date']

// 스토어의 데이터를 직접 참조 (computed 사용)
const rawData = computed(() => cameraStore.items)

// 폼 필드 정의 (실제 DB 스키마에 맞춤)
const formFields: FormField[] = [
  { id: 'cctv_id', label: '카메라 ID (CCTV_ID)', type: 'text', required: true, placeholder: '예: CAM-001' },
  { id: 'camera_no', label: '카메라 관리 번호', type: 'text', required: true },
  { id: 'hq_code', label: '본부 코드', type: 'text', required: true },
  { id: 'branch_code', label: '지사 코드', type: 'text', required: true },
  { id: 'route_code', label: '노선 코드', type: 'text', required: true },
  { id: 'location', label: '설치 위치', type: 'text', required: true },
  { id: 'camera_area', label: '설치 지역', type: 'text', required: false },
  { id: 'enc_url', label: '인코더 URL', type: 'text', required: false },
  { id: 'trans_wms_port', label: '변환 서버 WMS 포트', type: 'text', required: false },
  { id: 'link_id_s', label: '표준 노드 링크 시작점', type: 'text', required: false },
  { id: 'link_id_e', label: '표준 노드 링크 종료점', type: 'text', required: false },
  { id: 'vlink_id_s', label: 'VLINK_ID_S', type: 'text', required: false },
  { id: 'vlink_id_e', label: 'VLINK_ID_E', type: 'text', required: false },
  { id: 'road_id', label: '설치 고속도로 ID', type: 'text', required: false },
  { id: 'road_name', label: '설치 고속도로 이름', type: 'text', required: false },
  { id: 'milepost', label: '이정', type: 'text', required: false },
  { id: 'bound', label: '설치 방향', type: 'text', required: false },
  { id: 'lat', label: '경도 좌표', type: 'text', required: false },
  { id: 'lng', label: '위도 좌표', type: 'text', required: false },
  { id: 'fileurl_wmv', label: 'WMV 파일 저장 경로', type: 'text', required: false },
  { id: 'fileurl_mp4', label: 'MP4 파일 저장 경로', type: 'text', required: false },
  { id: 'fileurl_img', label: '정지 영상 저장 경로', type: 'text', required: false },
  { id: 'stat', label: '처리 중 표식', type: 'text', required: false },
  { id: 'alive', label: '동작 중인지 표시', type: 'yesno', required: false },
  { id: 'alive_yn', label: 'ALIVE 사용 여부', type: 'yesno', required: false },
  { id: 'update_date', label: '수정 일자', type: 'text', required: false, placeholder: 'YYYY-MM-DD HH:mm:ss' },
  { id: 'last_cctv_time', label: '마지막 CCTV 동작 시간', type: 'text', required: false, placeholder: 'YYYY-MM-DD HH:mm:ss' },
  { id: 'hls_url', label: 'HLS URL', type: 'text', required: false },
  { id: 'hls_alive', label: 'HLS 동작 여부', type: 'yesno', required: false },
  { id: 'hls_duration', label: 'HLS 개별 파일별 지속 시간', type: 'text', required: false },
  { id: 'hls_emergency', label: '응급 URL 여부', type: 'yesno', required: false },
  { id: 'ftp_sent_date', label: 'FTP 전송 시간', type: 'text', required: false, placeholder: 'YYYY-MM-DD HH:mm:ss' },
  { id: 'reg_date', label: '등록 일자', type: 'text', required: false, placeholder: 'YYYY-MM-DD' }
]

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  if (isSubmitting.value || cameraStore.isLoading) {
    console.warn('이미 처리 중인 요청이 있습니다.')
    return
  }
  try {
    isSubmitting.value = true
    if (isNew) {
      await cameraStore.createCamera(data as Camera)
    } else {
      await cameraStore.updateCamera(data.cctv_id, data)
    }
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const errorMessage = cameraStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  if (isSubmitting.value || cameraStore.isLoading) {
    console.warn('이미 처리 중인 요청이 있습니다.')
    return
  }
  try {
    isSubmitting.value = true
    await cameraStore.deleteCameras(ids)
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = cameraStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  cameraStore.fetchCameras()
})

// 서버 할당 버튼 핸들러
const handleServerAssign = () => {
  console.log('서버 할당 클릭')
  // TODO: 서버 할당 로직 구현
}

// CDN 연계 정보 생성 버튼 핸들러
const handleCdnInfoCreate = () => {
  console.log('CDN 연계 정보 생성 클릭')
  // TODO: CDN 연계 정보 생성 로직 구현
}
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>
