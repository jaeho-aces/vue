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
import { useAlertStore } from '../../../stores/alert'

// Pinia 스토어 사용
const cameraStore = useCameraInfoStore()
const alertStore = useAlertStore()
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

// Camera 인터페이스는 stores/cameraInfo.ts에서 import하므로 여기서는 제거

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120

// 컬럼 정의 (실제 DB 스키마에 맞춤)
const columns: TableColumn[] = [
  { id: 'cctv_id', header: '카메라 ID', size: 140, cellComponent: TextCell },
  { id: 'camera_no', header: '관리 번호', size: 100, cellComponent: TextCell },
  { id: 'hq_code', header: '본부 코드', size: 100, cellComponent: TextCell },
  { id: 'branch_code', header: '지사 코드', size: 100, cellComponent: TextCell },
  { id: 'route_code', header: '노선 코드', size: 100, cellComponent: TextCell },
  { id: 'location', header: '설치 위치', size: 120, cellComponent: TextCell },
  { id: 'camera_area', header: '설치 지역', size: 150, cellComponent: TextCell },
  { id: 'enc_url', header: '인코더 URL', size: 200, cellComponent: TextCell },
  { id: 'trans_wms_port', header: 'WMS 포트', size: 120, cellComponent: TextCell },
  { id: 'road_name', header: '고속도로 명', size: 150, cellComponent: TextCell },
  { id: 'milepost', header: '이정', size: 100, cellComponent: TextCell },
  { id: 'lat', header: '경도', size: 120, cellComponent: TextCell },
  { id: 'lng', header: '위도', size: 120, cellComponent: TextCell },
  { id: 'fileurl_mp4', header: 'MP4 경로', size: 180, cellComponent: TextCell },
  { id: 'stat', header: '처리 중', size: 90, cellComponent: YesNoCell },
  { id: 'alive', header: '동작 여부', size: 90, cellComponent: YesNoCell },
  { id: 'hls_url', header: 'HLS URL', size: 200, cellComponent: TextCell },
  { id: 'hls_alive', header: 'HLS 동작', size: 90, cellComponent: YesNoCell },
  { id: 'reg_date', header: '등록 일자', size: 160, cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = [
  'cctv_id', 'camera_no', 'hq_code', 'branch_code', 'location', 'road_name', 'alive', 'reg_date'
]

// 스토어의 데이터를 직접 참조 (computed 사용)
const rawData = computed(() => cameraStore.items)

// 폼 필드 정의 (실제 DB 스키마에 맞춤)
const formFields: FormField[] = [
  { id: 'cctv_id', label: '카메라 ID', type: 'text', required: true, placeholder: 'CCTV000XXXXX' },
  { id: 'camera_no', label: '카메라 관리 번호', type: 'text', required: true, placeholder: '00000~99999' },
  { id: 'hq_code', label: '본부 코드', type: 'text', required: true, placeholder: '00~99' },
  { id: 'branch_code', label: '지사 코드', type: 'text', required: true, placeholder: '00~99' },
  { id: 'route_code', label: '노선 코드', type: 'text', required: true, placeholder: '00~99' },
  { id: 'location', label: '설치 위치', type: 'text', placeholder: '한글/영문' },
  { id: 'camera_area', label: '설치 지역', type: 'text', placeholder: '한글/영문' },
  { id: 'enc_url', label: '인코더 URL', type: 'text', required: true, placeholder: '영문 URL' },
  { id: 'trans_wms_port', label: '변환 서버 WMS 포트', type: 'text', placeholder: '0~65535' },
  { id: 'road_name', label: '설치 고속도로 명', type: 'text', placeholder: '한글/영문' },
  { id: 'milepost', label: '이정 (위치 지점)', type: 'text', placeholder: 'XXXX.XX' },
  { id: 'lat', label: '경도', type: 'text', placeholder: 'GPS 좌표' },
  { id: 'lng', label: '위도', type: 'text', placeholder: 'GPS 좌표' },
  { id: 'fileurl_mp4', label: 'MP4 저장 경로', type: 'text' },
  { id: 'stat', label: '처리 중 표식', type: 'text', required: true, placeholder: 'Y / N' },
  { id: 'alive', label: '동작 여부', type: 'text', required: true, placeholder: 'Y / N' },
  { id: 'hls_url', label: 'HLS 스트리밍 URL', type: 'text', required: true, placeholder: 'URL 형식' },
  { id: 'hls_alive', label: 'HLS 동작 여부', type: 'text', required: true, placeholder: 'Y / N' },
  { id: 'reg_date', label: '등록 일자', type: 'text', required: true, placeholder: 'YYYY/MM/DD HH:mm:SS' }
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
    alertStore.show(isNew ? '신규 생성 완료' : '수정 완료', 'success')
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const errorMessage = cameraStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
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
    alertStore.show('삭제 완료', 'success')
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = cameraStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
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
