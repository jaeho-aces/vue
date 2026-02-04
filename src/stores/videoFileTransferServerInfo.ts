import { defineStore } from 'pinia'
import { ApiStoreHelper, BaseStoreState } from '../utils/apiStore'

// 백엔드 스키마와 동일한 타입 (변환 없이 사용)
export interface VideoFileTransferServer {
    fts_id: string
    fts_name: string
    fts_type: string
    ip_addr: string
    fts_target_ip: string
    fts_target_root_dir: string
    user_id: string
    password: string
    reg_date: string | null
}

interface VideoFileTransferServerState {
    items: VideoFileTransferServer[]
    isLoading: boolean
    error: string | null
    lastFetched: number | null // 마지막 로드 시간 (캐싱용)
}

export const useVideoFileTransferServerStore = defineStore('videoFileTransferServer', {
    state: (): VideoFileTransferServerState => ({
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
            return state.items.find(item => item.fts_id === id)
        },

        // 검색
        search: (state) => (query: string) => {
            const lowerQuery = query.toLowerCase()
            return state.items.filter(item =>
                item.fts_id.toLowerCase().includes(lowerQuery) ||
                item.fts_name.toLowerCase().includes(lowerQuery) ||
                item.ip_addr.toLowerCase().includes(lowerQuery) ||
                item.fts_target_ip.toLowerCase().includes(lowerQuery)
            )
        }
    },

    actions: {
        // 백엔드 API 응답을 프론트엔드 형식으로 변환
        transformFromAPI(data: any): VideoFileTransferServer {
            return {
                fts_id: data.fts_id || '',
                fts_name: data.fts_name || '',
                fts_type: data.fts_type || '',
                ip_addr: data.ip_addr || '',
                fts_target_ip: data.fts_target_ip || '',
                fts_target_root_dir: data.fts_target_root_dir || '',
                user_id: data.user_id || '',
                password: data.password || '',
                reg_date: data.reg_date || null
            }
        },

        // 프론트엔드 데이터를 백엔드 API 형식으로 변환
        transformToAPI(data: any): any {
            return {
                fts_id: data.fts_id,
                fts_name: data.fts_name,
                fts_type: data.fts_type,
                ip_addr: data.ip_addr,
                fts_target_ip: data.fts_target_ip,
                fts_target_root_dir: data.fts_target_root_dir,
                user_id: data.user_id,
                password: data.password,
                reg_date: data.reg_date
            }
        },

        // 헬퍼 인스턴스 생성
        getHelper() {
            return new ApiStoreHelper<VideoFileTransferServer, VideoFileTransferServer>(
                '/video-file-transfer-server',
                this.transformFromAPI.bind(this),
                this.transformToAPI.bind(this),
                this.$state as BaseStoreState<VideoFileTransferServer>
            )
        },

        // PHP 테이블 정보
        getPhpTableName() {
            return 'MGMT_FTS'
        },

        getPhpTableKey() {
            return 'FTS_ID'
        },

        // 데이터 목록 가져오기 - PHP 백엔드 사용
        async fetchTransferServers(forceRefresh = false) {
            await this.getHelper().fetchAll(
                forceRefresh,
                5 * 60 * 1000,
                '영상 파일 전송 서버 정보 데이터',
                this.getPhpTableName()
            )
        },

        // 데이터 생성 - PHP 백엔드 사용
        async createTransferServer(data: VideoFileTransferServer) {
            return await this.getHelper().create(
                data,
                this.getPhpTableName(),
                this.getPhpTableKey()
            )
        },

        // 데이터 수정 - PHP 백엔드 사용
        async updateTransferServer(ftsId: string, data: Partial<VideoFileTransferServer>) {
            return await this.getHelper().update(
                ftsId,
                data,
                this.getPhpTableName(),
                this.getPhpTableKey()
            )
        },

        // 데이터 삭제 - PHP 백엔드 사용
        async deleteTransferServer(ftsId: string) {
            await this.getHelper().delete(
                ftsId,
                this.getPhpTableName(),
                this.getPhpTableKey()
            )
        },

        // 여러 개 삭제 - PHP 백엔드 사용
        async deleteTransferServers(ftsIds: string[]) {
            await this.getHelper().deleteMany(
                ftsIds,
                this.getPhpTableName(),
                this.getPhpTableKey()
            )
        },

        // 스토어 초기화
        clear() {
            this.items = []
            this.error = null
            this.lastFetched = null
        }
    }
})
