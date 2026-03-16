/**
 * 표출그룹 저장/재생 (mgmt_user_display_group, mgmt_user_display_group_camera)
 */
import { defineStore } from 'pinia'
import { api } from '../services/api'
import { useAuthStore } from './auth'

const TABLE_GROUP = 'MGMT_USER_DISPLAY_GROUP'
const TABLE_CAMERA = 'MGMT_USER_DISPLAY_GROUP_CAMERA'

export interface DisplayGroup {
  group_id: string
  group_name: string
  user_id: string
  layout: string
}

/** API 응답은 object_id, type 사용. 파싱 후 ch_id, cctv_id, stream_type으로 노출 */
export interface DisplayGroupCamera {
  camera_id: string
  group_id: string
  user_id: string
  layout_index: number
  object_id: string
  type: string
  ch_id: string
  cctv_id: string
  stream_type: string
  label?: string
}

export interface SaveDisplayGroupPayload {
  group_name: string
  layout: string
  cameras: Array<{
    layout_index: number
    ch_id: string
    cctv_id: string
    label?: string
    stream_type: string
  }>
}

interface DisplayGroupState {
  items: DisplayGroup[]
  isLoading: boolean
  error: string | null
  lastFetched: number | null
}

export const useDisplayGroupStore = defineStore('displayGroup', {
  state: (): DisplayGroupState => ({
    items: [],
    isLoading: false,
    error: null,
    lastFetched: null
  }),

  getters: {
    getById: (state) => (id: string) =>
      state.items.find((item) => item.group_id === id)
  },

  actions: {
    async fetchDisplayGroups(forceRefresh = false) {
      const auth = useAuthStore()
      const userId = auth.user?.id ?? ''
      if (!userId) {
        this.items = []
        return
      }

      if (!forceRefresh && this.lastFetched && Date.now() - this.lastFetched < 60 * 1000) {
        return
      }

      this.isLoading = true
      this.error = null
      try {
        const res = await api.fastapi.getDbArray<DisplayGroup>(TABLE_GROUP, {
          layout: [{ field: '*' }],
          query: [],
          where: `user_id = '${userId}'`,
          order: 'group_name asc'
        })
        const raw = Array.isArray(res.data) ? res.data : []
        this.items = raw.filter((g: any) => (g.user_id || g.user_Id) === userId)
        if (this.items.length === 0 && raw.length > 0) this.items = raw
        this.lastFetched = Date.now()
      } catch (e: any) {
        this.error = e.response?.data?.detail ?? e.message ?? '표출그룹 목록 조회 실패'
        this.items = []
      } finally {
        this.isLoading = false
      }
    },

    /** object_id를 ch_id|cctv_id 형식으로 저장했으므로 파싱하여 ch_id, cctv_id, stream_type 반환 */
    async fetchCamerasByGroupId(groupId: string): Promise<DisplayGroupCamera[]> {
      this.error = null
      try {
        const res = await api.fastapi.getDbArray<any>(TABLE_CAMERA, {
          layout: [{ field: '*' }],
          query: [],
          where: `group_id = '${groupId}'`,
          order: 'layout_index asc'
        })
        const raw = Array.isArray(res.data) ? res.data : []
        const byGroup = raw.filter((c: any) => (c.group_id || c.group_Id) === groupId)
        const list = byGroup.length > 0 ? byGroup : raw
        return list.map((c: any) => {
          const objectId = c.object_id ?? c.object_Id ?? ''
          const [ch_id = '', cctv_id = ''] = objectId.includes('|') ? objectId.split('|') : ['', objectId]
          const stream_type = c.type ?? c.Type ?? 'original-rtsp'
          return {
            camera_id: c.camera_id ?? '',
            group_id: c.group_id ?? '',
            user_id: c.user_id ?? '',
            layout_index: Number(c.layout_index ?? 0),
            object_id: objectId,
            type: stream_type,
            ch_id: ch_id.trim(),
            cctv_id: (cctv_id || objectId).trim(),
            stream_type,
            label: cctv_id?.trim() || objectId
          }
        })
      } catch (e: any) {
        this.error = e.response?.data?.detail ?? e.message ?? '표출그룹 카메라 조회 실패'
        return []
      }
    },

    async saveDisplayGroup(payload: SaveDisplayGroupPayload): Promise<{ group_id: string } | null> {
      const auth = useAuthStore()
      const userId = auth.user?.id ?? ''
      if (!userId) {
        this.error = '로그인이 필요합니다.'
        return null
      }

      this.isLoading = true
      this.error = null
      try {
        const groupId = userId + '-' + Date.now()
        const groupRes = await api.fastapi.restAccess<DisplayGroup>(TABLE_GROUP, 'POST', {
          group_id: groupId,
          group_name: payload.group_name,
          user_id: userId,
          layout: payload.layout
        })

        const createdGroupId = (groupRes.data as any)?.group_id ?? groupId

        for (const cam of payload.cameras) {
          const cameraId = createdGroupId + '-' + cam.layout_index
          const object_id = cam.ch_id + '|' + cam.cctv_id
          await api.fastapi.restAccess(TABLE_CAMERA, 'POST', {
            camera_id: cameraId,
            group_id: createdGroupId,
            user_id: userId,
            object_id,
            type: cam.stream_type,
            layout_index: cam.layout_index
          })
        }

        this.lastFetched = null
        await this.fetchDisplayGroups(true)
        return { group_id: createdGroupId }
      } catch (e: any) {
        const d = e.response?.data?.detail
        this.error = Array.isArray(d)
          ? d.map((x: any) => (typeof x === 'string' ? x : x?.msg ?? JSON.stringify(x))).join(', ')
          : (typeof d === 'string' ? d : d ?? e.message ?? '표출그룹 저장 실패')
        return null
      } finally {
        this.isLoading = false
      }
    },

    async updateDisplayGroup(groupId: string, payload: SaveDisplayGroupPayload): Promise<boolean> {
      const auth = useAuthStore()
      const userId = auth.user?.id ?? ''
      if (!userId) {
        this.error = '로그인이 필요합니다.'
        return false
      }

      this.isLoading = true
      this.error = null
      try {
        await api.fastapi.restAccess<DisplayGroup>(TABLE_GROUP, 'PUT', {
          group_id: groupId,
          group_name: payload.group_name,
          user_id: userId,
          layout: payload.layout
        })

        const cameras = await this.fetchCamerasByGroupId(groupId)
        for (const cam of cameras) {
          const cameraId = cam.camera_id ?? (cam as any).camera_Id
          if (cameraId) {
            await api.fastapi.restAccess(TABLE_CAMERA, 'DELETE', null, cameraId)
          }
        }

        for (const cam of payload.cameras) {
          const cameraId = groupId + '-' + cam.layout_index
          const object_id = cam.ch_id + '|' + cam.cctv_id
          await api.fastapi.restAccess(TABLE_CAMERA, 'POST', {
            camera_id: cameraId,
            group_id: groupId,
            user_id: userId,
            object_id,
            type: cam.stream_type,
            layout_index: cam.layout_index
          })
        }

        this.lastFetched = null
        await this.fetchDisplayGroups(true)
        return true
      } catch (e: any) {
        const d = e.response?.data?.detail
        this.error = Array.isArray(d)
          ? d.map((x: any) => (typeof x === 'string' ? x : x?.msg ?? JSON.stringify(x))).join(', ')
          : (typeof d === 'string' ? d : d ?? e.message ?? '표출그룹 덮어쓰기 실패')
        return false
      } finally {
        this.isLoading = false
      }
    },

    async deleteDisplayGroup(groupId: string): Promise<boolean> {
      this.error = null
      try {
        const cameras = await this.fetchCamerasByGroupId(groupId)
        for (const cam of cameras) {
          const cameraId = cam.camera_id ?? (cam as any).camera_Id
          if (cameraId) {
            await api.fastapi.restAccess(TABLE_CAMERA, 'DELETE', null, cameraId)
          }
        }
        await api.fastapi.restAccess(TABLE_GROUP, 'DELETE', null, groupId)
        this.lastFetched = null
        await this.fetchDisplayGroups(true)
        return true
      } catch (e: any) {
        const d = e.response?.data?.detail
        this.error = typeof d === 'string' ? d : Array.isArray(d)
          ? d.map((x: any) => (typeof x === 'string' ? x : x?.msg ?? '')).join(', ')
          : e.message ?? '표출그룹 삭제 실패'
        return false
      }
    }
  }
})
