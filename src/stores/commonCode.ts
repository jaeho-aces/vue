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
    
    // 코드명 조회 헬퍼 (grp_gbn, grp_code, code로 code_name 반환)
    getCodeName: (state) => (grpGbn: string, grpCode: string, code: string) => {
      const item = state.items.find(
        item => 
          item.grp_gbn.toLowerCase() === grpGbn.toLowerCase() &&
          item.grp_code.toLowerCase() === grpCode.toLowerCase() &&
          item.code.toLowerCase() === code.toLowerCase()
      )
      return item?.code_name || code // 없으면 원본 코드 반환
    },
    
    // GRP_GBN과 CODE만으로 코드명 조회 (GRP_CODE 무시)
    // 본부: GRP_GBN="1", 지사: GRP_GBN="2", 노선: GRP_GBN="4"
    // 여러 개가 매칭되면 첫 번째 것 사용
    getCodeNameByGbn: (state) => (grpGbn: string, code: string) => {
      if (!code || !code.trim()) {
        return code // 빈 값이면 그대로 반환
      }
      
      // GRP_GBN과 CODE로 필터링 (GRP_CODE 무시)
      const matchedItems = state.items.filter(
        item => 
          String(item.grp_gbn).toLowerCase() === String(grpGbn).toLowerCase() &&
          String(item.code).toLowerCase() === String(code).toLowerCase()
      )
      
      // 매칭된 항목이 있으면 첫 번째 항목의 code_name 반환
      if (matchedItems.length > 0 && matchedItems[0].code_name) {
        return matchedItems[0].code_name
      }
      
      return code // 없으면 원본 코드 반환
    },
    
    // 복합 키로 코드명 조회
    getCodeNameByKey: (state) => (key: string) => {
      const parts = key.split('_')
      if (parts.length >= 3) {
        const [grpGbn, grpCode, ...codeParts] = parts
        const code = codeParts.join('_')
        return state.getCodeName(grpGbn, grpCode, code)
      }
      return key
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
    // 백엔드 API 응답을 프론트엔드 형식으로 변환
    transformFromAPI(data: any): CommonCode {
      return {
        id: data.id,
        grp_gbn: data.grp_gbn || '',
        grp_code: data.grp_code || '',
        code: data.code || '',
        code_name: data.code_name || '',
        short_code_name: data.short_code_name || '',
        remarks: data.remarks || '',
        ord: data.ord || 0,
        use_yn: data.use_yn || '',
        reg_date: data.reg_date,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    },

    // 프론트엔드 데이터를 백엔드 API 형식으로 변환
    transformToAPI(data: any): any {
      return {
        grp_gbn: data.grp_gbn,
        grp_code: data.grp_code,
        code: data.code,
        code_name: data.code_name,
        short_code_name: data.short_code_name,
        remarks: data.remarks,
        ord: data.ord,
        use_yn: data.use_yn,
        reg_date: data.reg_date
      }
    },

    // 헬퍼 인스턴스 생성
    getHelper() {
      return new ApiStoreHelper<CommonCode, CommonCode>(
        '/common-code',
        this.transformFromAPI.bind(this),
        this.transformToAPI.bind(this),
        this.$state as BaseStoreState<CommonCode>
      )
    },

    // PHP 테이블 정보
    getPhpTableName() {
      return 'MGMT_CODE'
    },

    getPhpTableKey() {
      return 'GRP_GBN,GRP_CODE,CODE' // 복합 키
    },

    // 데이터 목록 가져오기 - PHP 백엔드 사용
    async fetchCommonCodes(forceRefresh = false) {
      await this.getHelper().fetchAll(
        forceRefresh, 
        5 * 60 * 1000, 
        '공통 코드 데이터',
        this.getPhpTableName()
      )
      
      // 필드명 매핑: 백엔드 필드명 → 프론트엔드 필드명
      this.items = this.items.map((item: any) => ({
        grp_gbn: item.grp_gbn || item.grp_gbn,
        grp_code: item.grp_code || item.grp_code,
        code: item.code || item.code,
        code_name: item.code_name || item.code_name,
        short_code_name: item.short_code_name || item.short_code_name,
        remarks: item.remarks || item.remarks,
        ord: item.ord || item.ord || 0,
        use_yn: item.use_yn || item.use_yn,
        reg_timestamp: item.reg_date || item.reg_timestamp,
        created_at: item.created_at,
        updated_at: item.updated_at
      }))
    },

    // 데이터 생성 - PHP 백엔드 사용
    async createCommonCode(data: CommonCode) {
      // 프론트엔드 필드명 → 백엔드 필드명 변환
      const backendData: any = {
        GRP_GBN: data.grp_gbn,
        GRP_CODE: data.grp_code,
        CODE: data.code,
        CODE_NAME: data.code_name,
        SHORT_CODE_NAME: data.short_code_name || null,
        REMARKS: data.remarks || null,
        ORD: data.ord || 0,
        USE_YN: data.use_yn || 'Y',
        REG_DATE: data.reg_timestamp || null
      }
      
      return await this.getHelper().create(
        backendData,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 데이터 수정 - PHP 백엔드 사용 (복합 키 처리)
    async updateCommonCode(groupType: string, codeGroup: string, code: string, data: Partial<CommonCode>) {
      // 프론트엔드 필드명 → 백엔드 필드명 변환
      const backendData: any = {
        GRP_GBN: groupType,
        GRP_CODE: codeGroup,
        CODE: code
      }
      if (data.code_name !== undefined) backendData.CODE_NAME = data.code_name
      if (data.short_code_name !== undefined) backendData.SHORT_CODE_NAME = data.short_code_name
      if (data.remarks !== undefined) backendData.REMARKS = data.remarks
      if (data.ord !== undefined) backendData.ORD = data.ord
      if (data.use_yn !== undefined) backendData.USE_YN = data.use_yn
      if (data.reg_timestamp !== undefined) backendData.REG_DATE = data.reg_timestamp
      
      // 복합 키를 쉼표로 구분된 문자열로 전달
      const compositeKey = `${groupType},${codeGroup},${code}`
      
      const result = await this.getHelper().update(
        compositeKey,
        backendData,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
      
      // 목록에서 해당 항목 업데이트
      const index = this.items.findIndex(item => 
        item.grp_gbn === groupType && 
        item.grp_code === codeGroup && 
        item.code === code
      )
      if (index !== -1 && result) {
        this.items[index] = {
          grp_gbn: groupType,
          grp_code: codeGroup,
          code: code,
          code_name: result.code_name || data.code_name || this.items[index].code_name,
          short_code_name: result.short_code_name || data.short_code_name || this.items[index].short_code_name,
          remarks: result.remarks || data.remarks || this.items[index].remarks,
          ord: result.ord || data.ord || this.items[index].ord,
          use_yn: result.use_yn || data.use_yn || this.items[index].use_yn,
          reg_timestamp: result.reg_timestamp || data.reg_timestamp || this.items[index].reg_timestamp,
          created_at: result.created_at,
          updated_at: result.updated_at
        } as CommonCode
      }
      this.lastFetched = Date.now()
      
      return result
    },

    // 데이터 삭제 - PHP 백엔드 사용 (복합 키 처리)
    async deleteCommonCode(groupType: string, codeGroup: string, code: string) {
      // 복합 키를 쉼표로 구분된 문자열로 전달
      const compositeKey = `${groupType},${codeGroup},${code}`
      
      await this.getHelper().delete(
        compositeKey,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
      
      // 목록에서 제거
      this.items = this.items.filter(item => 
        !(item.grp_gbn === groupType && 
          item.grp_code === codeGroup && 
          item.code === code)
      )
      this.lastFetched = Date.now()
    },

    // 여러 개 삭제 - PHP 백엔드 사용 (복합 키 처리)
    async deleteCommonCodes(keys: string[]) {
      // 복합 키에서 grp_gbn, grp_code, code 추출하여 삭제
      const deletePromises = keys.map(key => {
        const [groupType, codeGroup, code] = key.split('_')
        const compositeKey = `${groupType},${codeGroup},${code}`
        return this.getHelper().delete(
          compositeKey,
          this.getPhpTableName(),
          this.getPhpTableKey()
        )
      })
      
      await Promise.all(deletePromises)
      
      // 목록에서 제거
      this.items = this.items.filter(item => {
        const itemKey = getCommonCodeKey(item)
        return !keys.includes(itemKey)
      })
      this.lastFetched = Date.now()
    },

    // 스토어 초기화
    clear() {
      this.items = []
      this.error = null
      this.lastFetched = null
    }
  }
})

