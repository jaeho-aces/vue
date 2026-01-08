<template>
  <div class="virtual-tree-container">
    <div v-if="flattenedNodes.length > 0" class="tree-list">
      <div
        v-for="(node, index) in flattenedNodes"
        :key="node.id || index"
        class="tree-node-wrapper"
        :style="{
          paddingLeft: `${(node.level || 0) * 20}px`
        }"
      >
        <!-- 트리 연결선 -->
        <div
          v-if="(node.level || 0) > 0"
          class="tree-line"
          :style="{
            left: `${((node.level || 0) - 1) * 20 + 8}px`
          }"
        ></div>
        
        <div class="tree-node">
          <button
            @click="toggleNode(node)"
            :class="[
              'tree-node-button',
              {
                'has-children': node.hasChildren,
                'is-open': node.isOpen,
                'is-selected': selectedNodeId === node.id
              }
            ]"
          >
            <!-- 확장/축소 아이콘 -->
            <div class="tree-expand-icon">
              <ChevronRight
                v-if="node.hasChildren"
                :size="16"
                :class="[
                  'expand-arrow',
                  { 'expanded': node.isOpen }
                ]"
              />
              <div v-else class="expand-placeholder"></div>
            </div>
            
            <!-- 노드 아이콘 -->
            <div class="tree-node-icon-wrapper">
              <component
                v-if="node.icon"
                :is="node.icon"
                :size="18"
                class="tree-node-icon"
              />
              <Folder
                v-else-if="node.hasChildren"
                :size="18"
                :class="[
                  'tree-node-icon',
                  'folder-icon',
                  { 'folder-open': node.isOpen }
                ]"
              />
              <File
                v-else
                :size="18"
                class="tree-node-icon file-icon"
              />
            </div>
            
            <span class="tree-node-label">{{ node.label }}</span>
          </button>
        </div>
      </div>
    </div>
    <div v-else class="empty-tree">
      <p class="empty-message">데이터가 없습니다.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronRight, Folder, File } from 'lucide-vue-next'

interface TreeNode {
  id?: string
  label: string
  icon?: any
  children?: TreeNode[]
  level?: number
  parentId?: string | null
  isOpen?: boolean
  hasChildren?: boolean
  defaultOpen?: boolean
}

interface Props {
  data: TreeNode[]
  itemHeight?: number
  searchTerm?: string
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 32,
  searchTerm: ''
})

const emit = defineEmits<{
  nodeClick: [node: TreeNode]
}>()

const openNodes = ref<Set<string>>(new Set())
const selectedNodeId = ref<string | null>(null)

// 트리 데이터를 플랫 리스트로 변환
const flattenTree = (nodes: TreeNode[], level = 0, parentId: string | null = null): TreeNode[] => {
  const result: TreeNode[] = []
  
  for (const node of nodes) {
    const nodeId = node.id || `${parentId || ''}-${node.label}`
    const hasChildren = !!(node.children && node.children.length > 0)
    const isOpen = openNodes.value.has(nodeId) || node.defaultOpen || false
    
    const flatNode: TreeNode = {
      ...node,
      id: nodeId,
      level,
      parentId,
      hasChildren,
      isOpen
    }
    
    result.push(flatNode)
    
    // 노드가 열려있고 자식이 있으면 자식도 추가
    if (isOpen && hasChildren && node.children) {
      result.push(...flattenTree(node.children, level + 1, nodeId))
    }
  }
  
  return result
}

// 검색 필터링
const filterTree = (nodes: TreeNode[], term: string): TreeNode[] => {
  if (!term) return nodes
  
  return nodes.reduce((acc: TreeNode[], node: TreeNode) => {
    const matches = node.label.toLowerCase().includes(term.toLowerCase())
    const filteredChildren = node.children ? filterTree(node.children, term) : []
    
    if (matches || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: filteredChildren,
        defaultOpen: true // 검색 시 자동으로 열림
      })
    }
    return acc
  }, [])
}

// 필터링된 트리 데이터
const filteredData = computed(() => {
  return filterTree(props.data, props.searchTerm)
})

// 플랫 리스트로 변환된 노드들
const flattenedNodes = computed(() => {
  return flattenTree(filteredData.value)
})

// 노드 토글
const toggleNode = (node: TreeNode) => {
  selectedNodeId.value = node.id || null
  
  if (!node.hasChildren) {
    emit('nodeClick', node)
    return
  }
  
  const nodeId = node.id!
  if (openNodes.value.has(nodeId)) {
    openNodes.value.delete(nodeId)
  } else {
    openNodes.value.add(nodeId)
  }
}
</script>

<style scoped>
.virtual-tree-container {
  height: 100%;
  overflow: auto;
  position: relative;
  padding: 4px 0;
}

.tree-list {
  display: flex;
  flex-direction: column;
}

.tree-node-wrapper {
  position: relative;
  min-height: 32px;
  display: flex;
  align-items: center;
}

.tree-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    #e2e8f0 10%,
    #e2e8f0 90%,
    transparent 100%
  );
  pointer-events: none;
}

.tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 1;
}

.tree-node-button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 12px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #334155;
  transition: all 0.2s ease;
  position: relative;
}

.tree-node-button:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

.tree-node-button.is-selected {
  background-color: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}

.tree-node-button.is-selected .tree-node-icon {
  color: #2563eb;
}

.tree-expand-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.expand-arrow {
  color: #94a3b8;
  transition: transform 0.2s ease;
  cursor: pointer;
}

.expand-arrow.expanded {
  transform: rotate(90deg);
  color: #64748b;
}

.expand-placeholder {
  width: 16px;
  height: 16px;
}

.tree-node-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.tree-node-icon {
  color: #64748b;
  flex-shrink: 0;
  transition: color 0.2s ease;
}

.tree-node-button:hover .tree-node-icon {
  color: #475569;
}

.tree-node-button.is-selected .tree-node-icon {
  color: #2563eb;
}

.folder-icon {
  color: #f59e0b;
}

.folder-icon.folder-open {
  color: #f97316;
}

.file-icon {
  color: #64748b;
}

.tree-node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 400;
  transition: font-weight 0.2s ease;
}

.tree-node-button.has-children .tree-node-label {
  font-weight: 500;
}

.tree-node-button.is-selected .tree-node-label {
  font-weight: 600;
}

/* 스크롤바 스타일 */
.virtual-tree-container::-webkit-scrollbar {
  width: 8px;
}

.virtual-tree-container::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 4px;
}

.virtual-tree-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.virtual-tree-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.empty-tree {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

.empty-message {
  color: #94a3b8;
  font-size: 0.875rem;
  text-align: center;
}
</style>
