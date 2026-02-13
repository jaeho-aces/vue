<template>
  <div class="flex-1 flex gap-4 min-h-0">
    <!-- Left Sidebar - Server Tree -->
    <div class="w-64 bg-white rounded-xl border border-slate-200 flex flex-col shrink-0">
      <div class="p-2 border-b border-slate-200">
        <div class="flex flex-wrap gap-1">
          <button
            v-for="filter in treeFilters"
            :key="filter.id"
            @click="handleTreeFilterChange(filter.id)"
            :class="[
              'px-2 py-1 text-xs rounded border transition-colors',
              treeFilter === filter.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            ]"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>
      <div class="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-slate-800 text-sm">
            카메라 목록
          </h3>
          <span class="text-xs text-slate-400">
            {{ getTotalCount(treeFilter) }}대
          </span>
        </div>
        <div class="relative">
          <input
            type="text"
            placeholder="카메라 검색..."
            :value="searchTerm"
            @input="handleSearchChange"
            class="w-full text-xs bg-white border border-slate-200 rounded-md pl-8 pr-2 py-1.5 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search :size="12" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
      <div class="flex-1 p-2">
        <!-- Virtual Tree Structure -->
        <div v-if="filteredTreeData.length === 0 && searchTerm" class="text-center py-4">
          <p class="text-xs text-slate-400">검색 결과가 없습니다.</p>
        </div>
        <VirtualTree
          v-else
          :data="filteredTreeData"
          :item-height="32"
          :search-term="searchTerm"
          @node-click="handleNodeClick"
        />
      </div>
    </div>

    <!-- Right Area - Video Grid -->
    <div class="flex-1 flex flex-col gap-4 min-h-0">
      <!-- Grid Layout Selector -->
      <div class="video-view-button-group-container">
        <div class="video-view-button-group">
          <button
            v-for="type in streamTypes"
            :key="type.id"
            @click="handleStreamTypeChange(type.id)"
            :class="[
              'video-view-button-group-item',
              streamType === type.id ? 'video-view-button-group-item-active' : 'video-view-button-group-item-inactive'
            ]"
          >
            {{ type.label }}
          </button>
        </div>

        <div class="video-view-button-group">
          <button
            v-for="layout in gridLayouts"
            :key="layout.id"
            @click="handleGridLayoutChange(layout.id)"
            :class="[
              'video-view-button-group-item',
              gridLayout === layout.id ? 'video-view-button-group-item-active' : 'video-view-button-group-item-inactive'
            ]"
          >
            {{ layout.label }}
          </button>
        </div>
      </div>

      <!-- Video Grid -->
      <div :class="['flex-1 grid gap-3 min-h-0', gridClass]">
        <div
          v-for="i in gridCount"
          :key="i"
          class="bg-slate-900 rounded-lg overflow-hidden relative group"
        >
          <div class="absolute inset-0 flex items-center justify-center text-slate-600">
            <Video :size="48" class="text-slate-700" />
          </div>
          <div class="absolute top-2 left-2 bg-red-600 px-2 py-0.5 rounded-[3px] flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            <span class="text-xs font-bold text-white tracking-tighter">LIVE</span>
          </div>
          <div class="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium truncate">
            CAM-{{ String(i).padStart(3, '0') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Video } from 'lucide-vue-next'
import VirtualTree from '../shared/VirtualTree.vue'

interface TreeFilter {
  id: string
  label: string
}

interface Props {
  treeFilters?: TreeFilter[]
  treeFilter?: string
  searchTerm?: string
  streamType?: string
  gridLayout?: string
  cctvTreeData?: Record<string, any[]>
}

const props = withDefaults(defineProps<Props>(), {
  treeFilters: () => [],
  treeFilter: 'virtual-server',
  searchTerm: '',
  streamType: 'default',
  gridLayout: '2x2',
  cctvTreeData: () => {
    // 가상서버 그룹핑 데이터
    const generateVirtualServerData = (): any[] => {
      const servers = ['가상서버-01', '가상서버-02', '가상서버-03', '가상서버-04']
      return servers.map((server, idx) => ({
        id: `virtual-server-${idx + 1}`,
        label: server,
        icon: null,
        children: Array.from({ length: 8 }, (_, i) => ({
          id: `virtual-server-${idx + 1}-cam-${i + 1}`,
          label: `CAM-${String(idx * 8 + i + 1).padStart(3, '0')}`,
          icon: null
        }))
      }))
    }

    // 미디어 그룹핑 데이터
    const generateMediaData = (): any[] => {
      const mediaServers = ['미디어서버-A', '미디어서버-B', '미디어서버-C']
      return mediaServers.map((server, idx) => ({
        id: `media-${idx + 1}`,
        label: server,
        icon: null,
        children: Array.from({ length: 10 }, (_, i) => ({
          id: `media-${idx + 1}-cam-${i + 1}`,
          label: `CAM-${String(idx * 10 + i + 1).padStart(3, '0')}`,
          icon: null
        }))
      }))
    }

    // 본부별 그룹핑 데이터
    const generateHeadquartersData = (): any[] => {
      const headquarters = ['서울본부', '부산본부', '대구본부', '인천본부', '광주본부']
      return headquarters.map((hq, idx) => ({
        id: `hq-${idx + 1}`,
        label: hq,
        icon: null,
        children: Array.from({ length: 5 }, (_, i) => ({
          id: `hq-${idx + 1}-zone-${i + 1}`,
          label: `${i + 1}구역`,
          icon: null,
          children: Array.from({ length: 6 }, (_, j) => ({
            id: `hq-${idx + 1}-zone-${i + 1}-cam-${j + 1}`,
            label: `CAM-${String(idx * 30 + i * 6 + j + 1).padStart(3, '0')}`,
            icon: null
          }))
        }))
      }))
    }

    // 노선별 그룹핑 데이터
    const generateRouteData = (): any[] => {
      const routes = ['1호선', '2호선', '3호선', '4호선', '경의선', '수인선']
      return routes.map((route, idx) => ({
        id: `route-${idx + 1}`,
        label: route,
        icon: null,
        children: Array.from({ length: 8 }, (_, i) => ({
          id: `route-${idx + 1}-station-${i + 1}`,
          label: `${i + 1}번역`,
          icon: null,
          children: Array.from({ length: 4 }, (_, j) => ({
            id: `route-${idx + 1}-station-${i + 1}-cam-${j + 1}`,
            label: `CAM-${String(idx * 32 + i * 4 + j + 1).padStart(3, '0')}`,
            icon: null
          }))
        }))
      }))
    }

    // 차단/SMS 그룹핑 데이터
    const generateBlockSmsData = (): any[] => {
      const categories = ['차단 카메라', 'SMS 알림 카메라', '일반 카메라']
      return categories.map((category, idx) => ({
        id: `block-sms-${idx + 1}`,
        label: category,
        icon: null,
        children: Array.from({ length: 12 }, (_, i) => ({
          id: `block-sms-${idx + 1}-cam-${i + 1}`,
          label: `CAM-${String(idx * 12 + i + 1).padStart(3, '0')}`,
          icon: null
        }))
      }))
    }

    return {
      'virtual-server': generateVirtualServerData(),
      'media': generateMediaData(),
      'headquarters': generateHeadquartersData(),
      'route': generateRouteData(),
      'block-sms': generateBlockSmsData()
    }
  }
})

const treeFilter = ref(props.treeFilter)
const searchTerm = ref(props.searchTerm)
const streamType = ref(props.streamType)
const gridLayout = ref(props.gridLayout)

// 그룹핑 필터 옵션
const treeFilters = [
  { id: 'virtual-server', label: '가상서버' },
  { id: 'media', label: '미디어' },
  { id: 'headquarters', label: '본부별' },
  { id: 'route', label: '노선별' },
  { id: 'block-sms', label: '차단/SMS' }
]

const streamTypes = [
  { id: 'default', label: '기본' },
  { id: 'original', label: '원본' },
  { id: 'transcoded', label: '변환' },
  { id: 'media', label: '미디어(RTSP)' }
]

const gridLayouts = [
  { id: '1x1', label: '1x1' },
  { id: '2x2', label: '2x2' },
  { id: '3x3', label: '3x3' },
  { id: '4x4', label: '4x4' }
]

const filterTree = (nodes: any[], term: string): any[] => {
  if (!term) return nodes
  return nodes.reduce((acc: any[], node: any) => {
    const matches = node.label.toLowerCase().includes(term.toLowerCase())
    const filteredChildren = node.children ? filterTree(node.children, term) : []

    if (matches || filteredChildren.length > 0) {
      acc.push({
        ...node,
        defaultOpen: true,
        children: filteredChildren
      })
    }
    return acc
  }, [])
}

// 그룹핑 필터에 따라 트리 데이터 필터링
const filteredTreeData = computed(() => {
  const currentData = props.cctvTreeData[treeFilter.value] || []
  const filtered = filterTree(currentData, searchTerm.value)
  return filtered
})

const gridClass = computed(() => {
  const [cols] = gridLayout.value.split('x').map(Number)
  return `grid-cols-${cols}`
})

const gridCount = computed(() => {
  const [rows, cols] = gridLayout.value.split('x').map(Number)
  return rows * cols
})

const handleTreeFilterChange = (id: string) => {
  treeFilter.value = id
}

const handleSearchChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchTerm.value = target.value
}

const handleStreamTypeChange = (id: string) => {
  streamType.value = id
}

const handleGridLayoutChange = (id: string) => {
  gridLayout.value = id
}

const handleNodeClick = (node: any) => {
  // 노드 클릭 시 처리 (필요시 구현)
  console.log('Node clicked:', node)
}

// 트리 데이터에서 총 카메라 개수 계산
const countCameras = (nodes: any[]): number => {
  let count = 0
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      count += countCameras(node.children)
    } else {
      count += 1
    }
  }
  return count
}

const getTotalCount = (filter: string): number => {
  const data = props.cctvTreeData[filter] || []
  return countCameras(data)
}
</script>

