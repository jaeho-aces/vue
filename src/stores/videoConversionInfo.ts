import { defineStore } from 'pinia'
import { ApiStoreHelper, BaseStoreState } from '../utils/apiStore'
import { api } from '../services/api'
import { useCommonCodeStore } from './commonCode'

// 상수 정의
const COMMON_CODE_LOAD_TIMEOUT_SECONDS = 10
const POLL_INTERVAL_MS = 100
const CACHE_DURATION_MS = 5 * 60 * 1000 // 5분

// CCTV 정보 타입 (MGMT_CCTV 테이블)
interface CctvInfo {
  cctv_id?: string
  cctv_ID?: string
  hq_code?: string
  hq_CODE?: string
  branch_code?: string
  branch_CODE?: string
  route_code?: string
  route_CODE?: string
}

// 카메라 코드 정보 타입
interface CameraCodeInfo {
  hq_code: string
  branch_code: string
  route_code: string
}

// 백엔드 스키마와 동일한 타입 (변환 없이 사용)
// 실제 백엔드 필드명은 API 응답을 확인 후 수정 필요
export interface VideoConversion {
  id?: number
  ch_id: string
  cctv_id?: string
  cctv_ID?: string
  hq_code?: string
  branch_code?: string
  route_code?: string
  area?: string
  server_id?: string
  trans_name?: string // 영상변환서버 이름 (조인된 데이터)
  media_server_id?: string
  live_yn?: string
  status?: string
  jpg_yn?: string
  wmv_yn?: string
  send_yn?: string
  save_yn?: string
  format?: string
  size?: string
  fps?: string
  kbps?: string
  wmv_conv_yn?: string
  wmv_size?: string
  wmv_fps?: string
  wmv_kbps?: string
  jpg_res?: string
  max_save?: string
  jpg_kbps?: string
  date_display_yn?: string
  sms_yn?: string
  sms_server?: string
  last_check?: string | null
  reg_date?: string | null
  created_at?: string
  updated_at?: string
}

interface VideoConversionInfoState {
  items: VideoConversion[]
  isLoading: boolean
  error: string | null
  lastFetched: number | null // 마지막 로드 시간 (캐싱용)
}

export const useVideoConversionInfoStore = defineStore('videoConversionInfo', {
  state: (): VideoConversionInfoState => ({
    items: [],
    isLoading: false,
    error: null,
    lastFetched: null
  }),

  getters: {
    // 전체 개수
    totalCount: (state) => state.items.length,
    
    // ID로 찾기
    getById: (state) => (id: string) => {
      return state.items.find(item => item.ch_id === id)
    },
    
    // 검색
    search: (state) => (query: string) => {
      const lowerQuery = query.toLowerCase()
      return state.items.filter(item =>
        item.ch_id.toLowerCase().includes(lowerQuery) ||
        item.hq_code?.toLowerCase().includes(lowerQuery) ||
        item.branch_code?.toLowerCase().includes(lowerQuery) ||
        item.route_code?.toLowerCase().includes(lowerQuery) ||
        item.area?.toLowerCase().includes(lowerQuery)
      )
    }
  },

  actions: {
    // 백엔드 API 응답을 프론트엔드 형식으로 변환
    transformFromAPI(data: any): VideoConversion {
      return {
        id: data.id,
        ch_id: data.ch_id || '',
        cctv_id: data.cctv_id,
        cctv_ID: data.cctv_id, // 대소문자 변형 대응
        hq_code: data.hq_code,
        branch_code: data.branch_code,
        route_code: data.route_code,
        area: data.area,
        server_id: data.server_id,
        trans_name: data.trans_name,
        media_server_id: data.media_server_id || data.fms_id,
        live_yn: data.live_yn,
        status: data.status || data.ch_alive, // ch_alive를 status로 매핑
        jpg_yn: data.jpg_yn || data.ch_jpg_yn,
        wmv_yn: data.wmv_yn || data.ch_wmv_yn,
        send_yn: data.send_yn,
        save_yn: data.save_yn,
        format: data.format || data.ch_venc, // ch_venc를 format으로 매핑
        size: data.size || data.ch_vsize, // ch_vsize를 size로 매핑
        fps: data.fps || data.ch_vfps, // ch_vfps를 fps로 매핑
        kbps: data.kbps || data.ch_vkpbs, // ch_vkpbs를 kbps로 매핑
        wmv_conv_yn: data.wmv_conv_yn,
        wmv_size: data.wmv_size || data.ch_wmv_vsize, // ch_wmv_vsize를 wmv_size로 매핑
        wmv_fps: data.wmv_fps || data.ch_wmv_vfps, // ch_wmv_vfps를 wmv_fps로 매핑
        wmv_kbps: data.wmv_kbps || data.ch_wmv_vkpbs, // ch_wmv_vkpbs를 wmv_kbps로 매핑
        jpg_res: data.jpg_res || data.ch_jpg_size, // ch_jpg_size를 jpg_res로 매핑
        max_save: data.max_save || data.ch_jpg_keep_count, // ch_jpg_keep_count를 max_save로 매핑
        jpg_kbps: data.jpg_kbps || data.ch_jpg_kbps, // ch_jpg_kbps를 jpg_kbps로 매핑
        date_display_yn: data.date_display_yn || data.ch_jpg_show_date, // ch_jpg_show_date를 date_display_yn으로 매핑
        sms_yn: data.sms_yn,
        sms_server: data.sms_server || data.sms_host_ip, // sms_host_ip를 sms_server로 매핑
        last_check: data.last_check || data.ch_alive_time, // ch_alive_time을 last_check로 매핑
        reg_date: data.reg_date
      }
    },

    // 프론트엔드 데이터를 백엔드 API 형식으로 변환
    transformToAPI(data: any): any {
      return {
        ch_id: data.ch_id,
        cctv_id: data.cctv_id || data.cctv_ID,
        trans_id: data.trans_id || data.server_id,
        fms_id: data.fms_id || data.media_server_id,
        kt_cctv: data.kt_cctv,
        ch_venc: data.ch_venc || data.format,
        ch_vsize: data.ch_vsize || data.size,
        ch_vfps: data.ch_vfps || data.fps,
        ch_vkpbs: data.ch_vkpbs || data.kbps,
        ch_alive: data.ch_alive || data.status,
        ch_alive_time: data.ch_alive_time || data.last_check,
        ch_wmv_venc: data.ch_wmv_venc,
        ch_wmv_vsize: data.ch_wmv_vsize || data.wmv_size,
        ch_wmv_vfps: data.ch_wmv_vfps || data.wmv_fps,
        ch_wmv_vkpbs: data.ch_wmv_vkpbs || data.wmv_kbps,
        ch_wmv_yn: data.ch_wmv_yn || data.wmv_yn,
        ch_jpg_size: data.ch_jpg_size || data.jpg_res,
        ch_jpg_kbps: data.ch_jpg_kbps || data.jpg_kbps,
        ch_jpg_yn: data.ch_jpg_yn || data.jpg_yn,
        ch_jpg_keep_count: data.ch_jpg_keep_count || data.max_save,
        ch_jpg_show_date: data.ch_jpg_show_date || data.date_display_yn,
        sms_host_ip: data.sms_host_ip || data.sms_server,
        reg_date: data.reg_date
      }
    },

    // 헬퍼 인스턴스 생성
    getHelper() {
      return new ApiStoreHelper<VideoConversion, VideoConversion>(
        '/video-conversion-info',
        this.transformFromAPI.bind(this),
        this.transformToAPI.bind(this),
        this.$state as BaseStoreState<VideoConversion>
      )
    },

    // PHP 테이블 정보
    getPhpTableName() {
      return 'MGMT_CHANNEL'
    },

    getPhpTableKey() {
      return 'CH_ID'
    },

    // CommonCode 로딩 대기 헬퍼 메서드 (코드 중복 제거)
    async waitForCommonCode(maxWaitSeconds = COMMON_CODE_LOAD_TIMEOUT_SECONDS): Promise<boolean> {
      const commonCodeStore = useCommonCodeStore()
      
      if (commonCodeStore.items.length === 0 && !commonCodeStore.isLoading) {
        await commonCodeStore.fetchCommonCodes()
      }
      
      if (commonCodeStore.isLoading) {
        const maxWait = (maxWaitSeconds * 1000) / POLL_INTERVAL_MS
        let waitCount = 0
        
        while (commonCodeStore.isLoading && waitCount < maxWait) {
          await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
          waitCount++
        }
        
        if (waitCount >= maxWait) {
          console.warn('CommonCode 로딩 타임아웃: 매핑을 건너뜁니다.')
          return false
        }
      }
      
      return commonCodeStore.items.length > 0
    },

    // 데이터 목록 가져오기 - FastAPI 백엔드 사용
    async fetchVideoConversions(forceRefresh = false) {
      await this.getHelper().fetchAll(
        forceRefresh, 
        CACHE_DURATION_MS, 
        '영상변환 채널정보 데이터',
        this.getPhpTableName()
      )
      
      await this.waitForCommonCode()
      
      const commonCodeStore = useCommonCodeStore()
      if (commonCodeStore.items.length > 0 && this.items.length > 0) {
        await this.mapCodeNames()
      }
    },

    async mapCodeNames() {
      const commonCodeLoaded = await this.waitForCommonCode()
      if (!commonCodeLoaded) {
        return
      }
      
      if (this.items.length === 0) {
        return
      }
      
      const commonCodeStore = useCommonCodeStore()
      
      const cctvIds = [...new Set(
        this.items
          .map((item: VideoConversion) => item.cctv_id || item.cctv_ID)
          .filter((id: string | undefined) => id && id.trim() !== '')
      )] as string[]
      
      if (cctvIds.length === 0) {
        return
      }
      
      try {
        const cameraResponse = await api.fastapi.getDbArray<CctvInfo>('MGMT_CCTV', {
          layout: [{ field: 'CCTV_ID' }, { field: 'HQ_CODE' }, { field: 'BRANCH_CODE' }, { field: 'ROUTE_CODE' }],
          query: cctvIds.map((id: string) => ({ cctv_id: id })),
          where: '',
          order: ''
        })
        
        const cameras = Array.isArray(cameraResponse.data) ? cameraResponse.data : []
        const cameraMap = new Map<string, CameraCodeInfo>()
        cameras.forEach((cam: CctvInfo) => {
          const cctvId = (cam.cctv_id || cam.cctv_ID || '').toLowerCase()
          if (cctvId) {
            cameraMap.set(cctvId, {
              hq_code: cam.hq_code || cam.hq_CODE || '',
              branch_code: cam.branch_code || cam.branch_CODE || '',
              route_code: cam.route_code || cam.route_CODE || ''
            })
          }
        })
        
        const updatedItems = this.items.map((item: VideoConversion) => {
          const cctvId = (item.cctv_id || item.cctv_ID || '').toLowerCase()
          const camera = cameraMap.get(cctvId)
          
          if (camera) {
            // 코드명 매핑 (getCodeNameByGbn 내부에서 대소문자 무시 비교)
            // 매핑 실패 시 원본 코드 사용
            const hqCode = camera.hq_code?.trim() || ''
            const branchCode = camera.branch_code?.trim() || ''
            const routeCode = camera.route_code?.trim() || ''
            
            const hqCodeName = hqCode ? commonCodeStore.getCodeNameByGbn('1', hqCode) : ''
            const branchCodeName = branchCode ? commonCodeStore.getCodeNameByGbn('2', branchCode) : ''
            const routeCodeName = routeCode ? commonCodeStore.getCodeNameByGbn('4', routeCode) : ''
            
            return {
              ...item,
              hq_code: hqCodeName || hqCode,
              branch_code: branchCodeName || branchCode,
              route_code: routeCodeName || routeCode
            }
          }
          
          return item
        })
        
        this.items = [...updatedItems]
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
        const errorStack = error instanceof Error ? error.stack : undefined
        console.error('소속 본부/노선 데이터 매핑 실패:', {
          message: errorMessage,
          stack: errorStack,
          error
        })
      }
    },

    // 데이터 생성 - PHP 백엔드 사용
    async createVideoConversion(data: VideoConversion) {
      return await this.getHelper().create(
        data,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 데이터 수정 - PHP 백엔드 사용
    async updateVideoConversion(chId: string, data: Partial<VideoConversion>) {
      return await this.getHelper().update(
        chId,
        data,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 데이터 삭제 - PHP 백엔드 사용
    async deleteVideoConversion(chId: string) {
      await this.getHelper().delete(
        chId,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 여러 개 삭제 - PHP 백엔드 사용
    async deleteVideoConversions(chIds: string[]) {
      await this.getHelper().deleteMany(
        chIds,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 일괄 변경 - PHP 백엔드 사용
    async batchUpdateVideoConversions(chIds: string[], data: Partial<VideoConversion>) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        
        // 각 항목을 개별적으로 업데이트
        const updatePromises = chIds.map(id => 
          this.getHelper().update(
            id,
            data,
            this.getPhpTableName(),
            this.getPhpTableKey()
          )
        )
        
        const results = await Promise.all(updatePromises)
        
        results.forEach((result: VideoConversion) => {
          if (result && result.ch_id) {
            const index = this.items.findIndex(item => item.ch_id === result.ch_id)
            if (index !== -1) {
              this.items[index] = result
            }
          }
        })
        
        this.lastFetched = Date.now()
        
        console.log('일괄 변경 완료:', chIds.length, '개')
        return results
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
        const errorStack = error instanceof Error ? error.stack : undefined
        console.error('일괄 변경 실패:', {
          message: errorMessage,
          stack: errorStack,
          error
        })
        this.error = this.getHelper().parseBackendError(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 스토어 초기화
    clear() {
      this.items = []
      this.error = null
      this.lastFetched = null
    }
  }
})

