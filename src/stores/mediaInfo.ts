import { defineStore } from 'pinia'
import { ApiStoreHelper, BaseStoreState } from '../utils/apiStore'

// 백엔드 스키마와 동일한 타입 (변환 없이 사용)
export interface Media {
    seq: string
    gbn: string
    camid: string
    title: string
    rtmp: string
    live: string
    stream: string
    stream1: string
    kt_cctv: string
    state: string
    reg_date: string | null
}

interface MediaInfoState {
    items: Media[]
    isLoading: boolean
    error: string | null
    lastFetched: number | null // 마지막 로드 시간 (캐싱용)
}

export const useMediaInfoStore = defineStore('mediaInfo', {
    state: (): MediaInfoState => ({
        items: [],
        isLoading: false,
        error: null,
        lastFetched: null
    }),

    getters: {
        // 전체 개수
        totalCount: (state) => state.items.length,

        // ID로 찾기
        getById: (state) => (seq: string) => {
            return state.items.find(item => item.seq === seq)
        },

        // 검색
        search: (state) => (query: string) => {
            const lowerQuery = query.toLowerCase()
            return state.items.filter(item =>
                item.seq.toLowerCase().includes(lowerQuery) ||
                item.camid.toLowerCase().includes(lowerQuery) ||
                item.title.toLowerCase().includes(lowerQuery)
            )
        }
    },

    actions: {
        // 백엔드 API 응답을 프론트엔드 형식으로 변환
        transformFromAPI(data: any): Media {
            return {
                seq: data.seq?.toString() || '',
                gbn: data.gbn?.toString() || '',
                camid: data.camid?.toString() || '',
                title: data.title || '',
                rtmp: data.rtmp || '',
                live: data.live || '',
                stream: data.stream || '',
                stream1: data.stream1 || '',
                kt_cctv: data.kt_cctv || '',
                state: data.state || 'N',
                reg_date: data.reg_date || null
            }
        },

        // 프론트엔드 데이터를 백엔드 API 형식으로 변환
        transformToAPI(data: any): any {
            return {
                seq: data.seq,
                gbn: data.gbn,
                camid: data.camid,
                title: data.title,
                rtmp: data.rtmp,
                live: data.live,
                stream: data.stream,
                stream1: data.stream1,
                kt_cctv: data.kt_cctv,
                state: data.state,
                reg_date: data.reg_date
            }
        },

        // 헬퍼 인스턴스 생성
        getHelper() {
            return new ApiStoreHelper<Media, Media>(
                '/media-info',
                this.transformFromAPI.bind(this),
                this.transformToAPI.bind(this),
                this.$state as BaseStoreState<Media>
            )
        },

        // PHP 테이블 정보
        getPhpTableName() {
            return 'MGMT_MEDIA_INFO'
        },

        getPhpTableKey() {
            return 'SEQ'
        },

        // 데이터 목록 가져오기 - PHP 백엔드 사용
        async fetchMediaList(forceRefresh = false) {
            await this.getHelper().fetchAll(
                forceRefresh,
                5 * 60 * 1000,
                '미디어 정보 데이터',
                this.getPhpTableName()
            )
        },

        // 데이터 생성 - PHP 백엔드 사용
        async createMedia(data: Media) {
            return await this.getHelper().create(
                data,
                this.getPhpTableName(),
                this.getPhpTableKey()
            )
        },

        // 데이터 수정 - PHP 백엔드 사용
        async updateMedia(seq: string, data: Partial<Media>) {
            return await this.getHelper().update(
                seq,
                data,
                this.getPhpTableName(),
                this.getPhpTableKey()
            )
        },

        // 데이터 삭제 - PHP 백엔드 사용
        async deleteMedia(seq: string) {
            await this.getHelper().delete(
                seq,
                this.getPhpTableName(),
                this.getPhpTableKey()
            )
        },

        // 여러 개 삭제 - PHP 백엔드 사용
        async deleteMediaList(seqs: string[]) {
            await this.getHelper().deleteMany(
                seqs,
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
