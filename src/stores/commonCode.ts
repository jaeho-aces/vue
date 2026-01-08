import { defineStore } from 'pinia'
import { ApiStoreHelper, BaseStoreState } from '../utils/apiStore'
import { api } from '../services/api'

// 백엔드 스키마와 동일한 타입 (변환 없이 사용)
export interface CommonCode {
  id?: number
  code_id?: string
  grp_gbn: string
  grp_code: string
  code: string
  code_name: string
  short_code_name: string
  remarks: string | null
  ord: number
  use_yn: string
  reg_timestamp: string | null
  created_at?: string
  updated_at?: string
}

// 복합 키 생성 헬퍼 함수
export const getCommonCodeKey = (item: CommonCode): string => {
  return `${item.grp_gbn}_${item.grp_code}_${item.code}`
}

interface CommonCodeState {
  items: CommonCode[]
  isLoading: boolean
  error: string | null
  lastFetched: number | null // 마지막 로드 시간 (캐싱용)
}

export const useCommonCodeStore = defineStore('commonCode', {
  state: (): CommonCodeState => ({
    items: [],
    isLoading: false,
    error: null,
    lastFetched: null
  }),

  getters: {
    // 전체 개수
    totalCount: (state) => state.items.length,
    
    // 그룹 코드와 코드로 찾기
    getByKey: (state) => (codeGroup: string, code: string) => {
      return state.items.find(item => item.grp_code === codeGroup && item.code === code)
    },
    
    // 그룹 코드로 필터링
    getByCodeGroup: (state) => (codeGroup: string) => {
      return state.items.filter(item => item.grp_code === codeGroup)
    },
    
    // 검색
    search: (state) => (query: string) => {
      const lowerQuery = query.toLowerCase()
      return state.items.filter(item =>
        item.grp_gbn.toLowerCase().includes(lowerQuery) ||
        item.grp_code.toLowerCase().includes(lowerQuery) ||
        item.code.toLowerCase().includes(lowerQuery) ||
        item.code_name.toLowerCase().includes(lowerQuery) ||
        item.short_code_name.toLowerCase().includes(lowerQuery)
      )
    }
  },

  actions: {
    // 헬퍼 인스턴스 생성 (변환 함수 없음)
    getHelper() {
      return new ApiStoreHelper<CommonCode, CommonCode>(
        '/common-code',
        null, // 변환 함수 없음
        null, // 변환 함수 없음
        this.$state as BaseStoreState<CommonCode>
      )
    },

    // 데이터 목록 가져오기
    async fetchCommonCodes(forceRefresh = false) {
      await this.getHelper().fetchAll(forceRefresh, 5 * 60 * 1000, '공통 코드 데이터')
    },

    // 데이터 생성
    async createCommonCode(data: CommonCode) {
      return await this.getHelper().create(data)
    },

    // 데이터 수정 (grp_gbn + grp_code + code 조합으로 식별)
    async updateCommonCode(groupType: string, codeGroup: string, code: string, data: Partial<CommonCode>) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        const apiData = { ...data, grp_gbn: groupType, grp_code: codeGroup, code }
        
        console.log('수정 요청 데이터:', apiData)
        
        // 백엔드 API는 grp_gbn, grp_code, code를 경로로 받을 것으로 예상
        const response = await api.put<CommonCode>(
          `/common-code/${groupType}/${codeGroup}/${code}`,
          apiData
        )
        
        // 목록에서 해당 항목 업데이트
        const index = this.items.findIndex(item => 
          item.grp_gbn === groupType && 
          item.grp_code === codeGroup && 
          item.code === code
        )
        if (index !== -1) {
          this.items[index] = response.data
        }
        this.lastFetched = Date.now()
        
        console.log('공통 코드 데이터 수정 완료:', response.data)
        return response.data
      } catch (error: any) {
        console.error('공통 코드 데이터 수정 실패:', error)
        this.error = this.getHelper().parseBackendError(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 데이터 삭제 (grp_gbn + grp_code + code 조합으로 식별)
    async deleteCommonCode(groupType: string, codeGroup: string, code: string) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        await api.delete(`/common-code/${groupType}/${codeGroup}/${code}`)
        
        // 목록에서 제거
        this.items = this.items.filter(item => 
          !(item.grp_gbn === groupType && 
            item.grp_code === codeGroup && 
            item.code === code)
        )
        this.lastFetched = Date.now()
        
        console.log('공통 코드 데이터 삭제 완료:', groupType, codeGroup, code)
      } catch (error: any) {
        console.error('공통 코드 데이터 삭제 실패:', error)
        this.error = this.getHelper().parseBackendError(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 여러 개 삭제 (복합 키 배열을 받아서 삭제)
    async deleteCommonCodes(keys: string[]) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        
        // 복합 키에서 grp_gbn, grp_code, code 추출
        const deletePromises = keys.map(key => {
          const [groupType, codeGroup, code] = key.split('_')
          return api.delete(`/common-code/${groupType}/${codeGroup}/${code}`)
        })
        
        await Promise.all(deletePromises)
        
        // 목록에서 제거
        this.items = this.items.filter(item => {
          const itemKey = getCommonCodeKey(item)
          return !keys.includes(itemKey)
        })
        this.lastFetched = Date.now()
        
        console.log('공통 코드 데이터 삭제 완료:', keys.length, '개')
      } catch (error: any) {
        console.error('공통 코드 데이터 삭제 실패:', error)
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

