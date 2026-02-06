<template>
  <div class="reusable-table-wrapper">
    <!-- 데이터 입력/수정 모달 -->
    <DataFormModal
      v-if="formFields && formFields.length > 0"
      :is-open="isModalOpen"
      :title="modalTitle || '데이터 입력/수정'"
      :fields="formFields"
      :initial-data="editingData || undefined"
      :size="modalSize || 'default'"
      @close="handleModalClose"
      @submit="handleModalSubmit"
    />

    <!-- 삭제 확인 모달 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="isDeleteConfirmOpen"
          class="delete-confirm-overlay"
          @mousedown.self="deleteConfirmMousedownOnOverlay = true"
          @mouseup.self="handleDeleteConfirmOverlayMouseUp"
        >
          <div class="delete-confirm-container" @mousedown.stop @click.stop>
            <div class="delete-confirm-header">
              <span class="delete-confirm-icon">⚠</span>
              <h2 class="delete-confirm-title">삭제 확인</h2>
              <button type="button" class="delete-confirm-close" @click="handleDeleteConfirmCancel" aria-label="닫기">×</button>
            </div>
            <div class="delete-confirm-body">
              <p class="delete-confirm-message">{{ deleteConfirmMessage }}</p>
            </div>
            <div class="delete-confirm-footer">
              <button type="button" class="delete-confirm-btn cancel" @click="handleDeleteConfirmCancel">취소</button>
              <button type="button" class="delete-confirm-btn confirm" @click="handleDeleteConfirm">삭제</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 상단 툴바 (컬럼 선택 + 버튼) -->
    <div class="top-toolbar">
      <div class="toolbar-left">
        <div class="column-selector-container">
          <div class="column-selector-wrapper" ref="columnSelectorRef">
            <button 
              @click="isColumnDropdownOpen = !isColumnDropdownOpen"
              class="column-selector-button"
            >
              컬럼 선택
              <span class="dropdown-arrow" :class="{ 'open': isColumnDropdownOpen }">▼</span>
            </button>
            <div v-if="isColumnDropdownOpen" class="column-dropdown">
              <div class="dropdown-header">
                <span>표시할 컬럼 선택</span>
                <button @click="isColumnDropdownOpen = false" class="close-button">×</button>
              </div>
              <div class="dropdown-content">
                <label 
                  v-for="column in columns" 
                  :key="column.id"
                  class="column-checkbox-label"
                >
                  <input
                    type="checkbox"
                    :checked="visibleColumns.has(column.id)"
                    @change="toggleColumn(column.id)"
                    class="column-checkbox"
                  />
                  <span>{{ column.header }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <!-- 데이터 개수 표시 -->
        <div class="data-count-info">
          <span class="data-count-text">
            전체: <strong>{{ totalDataCount }}</strong>개
            <span v-if="filteredDataCount !== totalDataCount" class="filtered-count">
              (표시: <strong>{{ filteredDataCount }}</strong>개)
            </span>
          </span>
        </div>
      </div>
      <div class="toolbar-right">
        <div class="button-group">
          <!-- 커스텀 버튼 슬롯 (기본 버튼 왼쪽) -->
          <slot name="toolbar-actions-left"></slot>
          <Button @click="handleNew" variant="primary">
            신규
          </Button>
          <Button 
            v-if="formFields && formFields.length > 0 && !props.hideEditButton"
            @click="handleEdit" 
            variant="secondary"
            :disabled="selectedRowIds.size !== 1"
          >
            수정
          </Button>
          <Button @click="handleDelete" variant="danger" :disabled="selectedRowIds.size === 0">
            삭제
          </Button>
        </div>
      </div>
    </div>
    <div
      class="table-container"
      ref="tableContainerRef"
      :style="{ overflowX: needsHorizontalScroll ? 'auto' : 'hidden' }"
    >
      <div
        class="table-wrapper"
        :style="{ width: needsHorizontalScroll ? `${effectiveTableWidth}px` : '100%' }"
      >
      <!-- 헤더 -->
      <div class="table-header sticky top-0 z-10 bg-slate-50">
        <div
          class="grid-header"
          :style="{
            gridTemplateColumns: gridTemplateColumns,
            gridTemplateRows: '40px',
            width: '100%'
          }"
        >
          <!-- 체크박스 컬럼 -->
          <div
            class="header-cell bg-slate-100 sticky-checkbox-column"
          >
            <div class="header-content">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="handleSelectAll"
                class="checkbox-input"
              />
            </div>
          </div>
          <!-- ID 컬럼 (idField가 있을 때만 표시) -->
          <div
            v-if="idField && idField.trim() !== '' && !hideIdColumn"
            class="header-cell bg-slate-100 border-r sticky-id-column"
            :class="{ 'filtered': columnFilters[idField]?.search || table.getColumn(idField)?.getIsSorted() }"
            :style="{ 
              left: `${getColumnWidth('checkbox', checkboxColumnWidth)}px`,
              borderLeft: '1px solid #e2e8f0' 
            }"
          >
            <div class="header-content">
              <span>ID</span>
              <button
                @click.stop="toggleFilterDropdown(idField, $event)"
                class="filter-button"
                :class="{ active: openFilterDropdown === idField || columnFilters[idField]?.search || table.getColumn(idField)?.getIsSorted() }"
              >
                <span class="filter-icon">🔍</span>
              </button>
            </div>
            <div
              class="resize-handle"
              @mousedown.stop="handleResizeStart(idField, $event.clientX, getColumnWidth(idField, idColumnWidth))"
            ></div>
            <!-- 필터 드롭다운 -->
            <div v-if="openFilterDropdown === idField" class="filter-dropdown">
              <div class="filter-section">
                <div class="filter-section-title">정렬</div>
                <div class="filter-options">
                  <button
                    @click="handleSort(idField, 'asc')"
                    :class="['filter-option', { active: table.getColumn(idField)?.getIsSorted() === 'asc' }]"
                  >
                    오름차순
                  </button>
                  <button
                    @click="handleSort(idField, 'desc')"
                    :class="['filter-option', { active: table.getColumn(idField)?.getIsSorted() === 'desc' }]"
                  >
                    내림차순
                  </button>
                </div>
              </div>
              <div class="filter-section">
                <div class="filter-section-title">검색</div>
                <input
                  :value="columnFilters[idField]?.search || ''"
                  @input="(e) => { if (!columnFilters[idField]) columnFilters[idField] = { search: '' }; columnFilters[idField].search = (e.target as HTMLInputElement).value }"
                  type="text"
                  placeholder="검색..."
                  class="filter-search-input"
                />
              </div>
              <div class="filter-section">
                <button
                  @click="clearFilter(idField)"
                  class="filter-clear-button"
                  :disabled="!columnFilters[idField]?.search && !table.getColumn(idField)?.getIsSorted()"
                >
                  필터 해제
                </button>
              </div>
            </div>
          </div>
          <!-- 모든 컬럼 헤더 -->
          <template v-for="column in visibleColumnsList" :key="column.id">
            <div 
              class="header-cell"
              :class="{ 'filtered': columnFilters[column.id]?.search || table.getColumn(column.id)?.getIsSorted() }"
            >
              <div class="header-content">
                <span>{{ column.header }}</span>
                <button
                  @click.stop="toggleFilterDropdown(column.id, $event)"
                  class="filter-button"
                  :class="{ active: openFilterDropdown === column.id || columnFilters[column.id]?.search || table.getColumn(column.id)?.getIsSorted() }"
                >
                  <span class="filter-icon">🔍</span>
                </button>
              </div>
              <div
                class="resize-handle"
                @mousedown.stop="handleResizeStart(column.id, $event.clientX, getColumnWidth(column.id, column.size))"
              ></div>
              <!-- 필터 드롭다운 -->
              <div v-if="openFilterDropdown === column.id" class="filter-dropdown">
                <div class="filter-section">
                  <div class="filter-section-title">정렬</div>
                  <div class="filter-options">
                    <button
                      @click="handleSort(column.id, 'asc')"
                      :class="['filter-option', { active: table.getColumn(column.id)?.getIsSorted() === 'asc' }]"
                    >
                      오름차순
                    </button>
                    <button
                      @click="handleSort(column.id, 'desc')"
                      :class="['filter-option', { active: table.getColumn(column.id)?.getIsSorted() === 'desc' }]"
                    >
                      내림차순
                    </button>
                  </div>
                </div>
                <div class="filter-section">
                  <div class="filter-section-title">검색</div>
                  <input
                    :value="columnFilters[column.id]?.search || ''"
                    @input="(e) => { if (!columnFilters[column.id]) columnFilters[column.id] = { search: '' }; columnFilters[column.id].search = (e.target as HTMLInputElement).value }"
                    type="text"
                    placeholder="검색..."
                    class="filter-search-input"
                  />
                </div>
                <div class="filter-section">
                  <button
                    @click="clearFilter(column.id)"
                    class="filter-clear-button"
                    :disabled="!columnFilters[column.id]?.search && !table.getColumn(column.id)?.getIsSorted()"
                  >
                    필터 해제
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      
      <!-- 본문 (가상 스크롤) -->
      <div
        class="table-body"
        :style="{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }"
        :key="`table-body-${sortedRowsHash || 'default'}`"
      >
        <template v-for="virtualRow in virtualizer.getVirtualItems()" :key="`${virtualRow.key}-${sortedRowsHash?.substring?.(0, 8) || ''}`">
          <!-- 각 데이터 항목을 개별적으로 배치 (1행) -->
          <div
            class="data-item-wrapper"
            :class="{
              'data-item-even': virtualRow.index % 2 === 0,
              'data-item-odd': virtualRow.index % 2 === 1,
              'data-item-selected': isRowSelected(getRowId(sortedRows[virtualRow.index]?.original))
            }"
            :style="{
              position: 'absolute',
              top: `${virtualRow.start}px`,
              left: 0,
              width: '100%',
              height: '40px'
            }"
            @click="handleRowClick(getRowId(sortedRows[virtualRow.index]?.original))"
          >
            <div
              class="grid-row"
              :style="{
                gridTemplateColumns: gridTemplateColumns,
                gridTemplateRows: '40px',
                width: '100%'
              }"
            >
              <!-- 체크박스 컬럼 (클릭 시 행 클릭과 중복 방지) -->
              <div
                class="data-cell data-cell-checkbox sticky-checkbox-column"
                :style="{ left: '0px' }"
                @click.stop
              >
                <input
                  type="checkbox"
                  :checked="isRowSelected(getRowId(sortedRows[virtualRow.index]?.original))"
                  @change="handleRowSelect(getRowId(sortedRows[virtualRow.index]?.original), $event)"
                  class="checkbox-input"
                />
              </div>
              <!-- ID 컬럼 (idField가 있을 때만 표시) -->
              <div
                v-if="idField && idField.trim() !== '' && !hideIdColumn"
                class="data-cell data-cell-id border-r border-slate-300 font-medium sticky-id-column"
                :style="{ 
                  left: `${getColumnWidth('checkbox', checkboxColumnWidth)}px`,
                  borderLeft: '1px solid #e2e8f0' 
                }"
              >
                {{ getRowId(sortedRows[virtualRow.index]?.original) }}
              </div>
              <!-- 모든 컬럼 데이터 -->
              <template v-for="column in visibleColumnsList" :key="column.id">
                <div class="data-cell hover:bg-slate-50 transition-colors">
                  <component
                    v-if="column.cellComponent"
                    :is="column.cellComponent"
                    :value="sortedRows[virtualRow.index]?.original?.[column.id]"
                    :row="sortedRows[virtualRow.index]"
                  />
                  <span v-else class="text-sm text-slate-700">
                    {{ sortedRows[virtualRow.index]?.original?.[column.id] }}
                  </span>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useVueTable, getCoreRowModel, getSortedRowModel } from '@tanstack/vue-table'
import { useVirtualizer } from '@tanstack/vue-virtual'
import type { ColumnDef } from '@tanstack/vue-table'
import { type Component } from 'vue'
import DataFormModal, { type FormField } from './DataFormModal.vue'
import Button from './Button.vue'
import { usePreferenceStore } from '../../stores/preference'

// 타입 정의
export interface TableColumn {
  id: string
  header: string
  size: number // 기본 너비
  cellComponent?: Component // 셀 컴포넌트 (선택사항)
  enableSorting?: boolean // 정렬 가능 여부
}

interface Props {
  modelValue: any[] // v-model로 데이터 관리
  columns: TableColumn[]
  defaultVisibleColumns?: string[] | Set<string>
  formFields?: FormField[]
  modalTitle?: string
  modalSize?: 'default' | 'large'
  checkboxColumnWidth?: number
  idColumnWidth?: number
  idField?: string
  hideEditButton?: boolean // 수정 버튼 숨김 옵션
  preferenceKey?: string // 컬럼 설정 저장 키
  hideIdColumn?: boolean // ID 컬럼 숨김 여부
}

const props = withDefaults(defineProps<Props>(), {
  checkboxColumnWidth: 50,
  idColumnWidth: 150,
  idField: 'id',
  defaultVisibleColumns: () => [],
  hideEditButton: false,
  preferenceKey: '',
  hideIdColumn: false,
  modalSize: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [data: any[]]
  new: []
  edit: [data: any]
  delete: [ids: string[]]
  update: [data: any, isNew: boolean]
}>()

// 기본 표시 컬럼 설정
const defaultVisibleSet = computed(() => {
  if (Array.isArray(props.defaultVisibleColumns)) {
    return new Set(props.defaultVisibleColumns)
  }
  if (props.defaultVisibleColumns instanceof Set) {
    return new Set(props.defaultVisibleColumns)
  }
  // 기본값: 모든 컬럼 표시
  return new Set(props.columns.map(col => col.id))
})

// 표시할 컬럼 관리
const visibleColumns = ref<Set<string>>(new Set(defaultVisibleSet.value))

const preferenceStore = usePreferenceStore()

// 드롭다운 열림/닫힘 상태
const isColumnDropdownOpen = ref(false)

// 필터 드롭다운 열림/닫힘 상태 (컬럼별)
const openFilterDropdown = ref<string | null>(null)

// 컬럼별 필터 상태
const columnFilters = ref<Record<string, { search: string }>>({})

// 정렬 상태 관리
const sorting = ref<Array<{ id: string; desc: boolean }>>([])

const columnSelectorRef = ref<HTMLElement | null>(null)

// 컬럼 너비 관리 (사용자가 조절한 너비 저장)
const columnWidthsState = ref<Record<string, number>>({})

// 컬럼 헤더 텍스트 길이에 따른 최소 너비 계산 (한글/영문 구분)
const estimateHeaderWidth = (text: string) => {
  if (!text) return 30
  let width = 0
  for (const char of text) {
    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(char)) {
      width += 15 // 한글 한 글자당 약 15px
    } else if (/[A-Z]/.test(char)) {
      width += 10 // 대문자 영문 약 10px
    } else {
      width += 8  // 소문자/숫자/기호 약 8px
    }
  }
  // 여백(16px) + 필터 아이콘 버튼(24px) + 여유 여백(15px)
  return width + 55 
}

const getHeaderMinWidth = (columnId: string) => {
  if (columnId === 'checkbox') return props.checkboxColumnWidth
  if (columnId === props.idField) return estimateHeaderWidth('ID')
  
  const col = props.columns.find(c => c.id === columnId)
  return col ? estimateHeaderWidth(col.header) : 30
}

// 컬럼 너비 가져오기 (사용자 조절값 또는 기본값)
const getColumnWidth = (columnId: string, defaultWidth: number) => {
  const minW = getHeaderMinWidth(columnId)
  const currentW = columnWidthsState.value[columnId] ?? defaultWidth
  return Math.max(minW, currentW)
}

// 리사이즈 상태
const resizingColumn = ref<string | null>(null)
const resizeStartX = ref(0)
const resizeStartWidth = ref(0)

// 리사이즈 시작
const handleResizeStart = (columnId: string, startX: number, currentWidth: number) => {
  resizingColumn.value = columnId
  resizeStartX.value = startX
  resizeStartWidth.value = currentWidth
  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', handleResizeEnd)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

// 리사이즈 중
const handleResizeMove = (e: MouseEvent) => {
  if (!resizingColumn.value) return
  
  const minW = getHeaderMinWidth(resizingColumn.value)
  const diff = e.clientX - resizeStartX.value
  const newWidth = Math.max(minW, resizeStartWidth.value + diff)
  columnWidthsState.value[resizingColumn.value] = newWidth
}

// 리사이즈 종료 (저장된 컬럼 너비 반영)
const handleResizeEnd = () => {
  if (resizingColumn.value && props.preferenceKey) {
    preferenceStore.setTableColumnWidths(props.preferenceKey, { ...columnWidthsState.value })
  }
  resizingColumn.value = null
  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', handleResizeEnd)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// 모달 상태
const isModalOpen = ref(false)
const editingData = ref<any | null>(null)

// 삭제 확인 모달 상태
const isDeleteConfirmOpen = ref(false)
const pendingDeleteIds = ref<string[]>([])
const deleteConfirmMousedownOnOverlay = ref(false)
const deleteConfirmMessage = computed(() => {
  const count = pendingDeleteIds.value.length
  return count === 1
    ? '선택한 1건을 삭제하시겠습니까?'
    : `선택한 ${count}건을 삭제하시겠습니까?`
})
const handleDeleteConfirmOverlayMouseUp = () => {
  if (deleteConfirmMousedownOnOverlay.value) handleDeleteConfirmCancel()
  deleteConfirmMousedownOnOverlay.value = false
}
const handleDeleteConfirmCancel = () => {
  isDeleteConfirmOpen.value = false
  pendingDeleteIds.value = []
}
const handleDeleteConfirm = () => {
  const ids = [...pendingDeleteIds.value]
  handleDeleteConfirmCancel()
  internalData.value = internalData.value.filter((item: any) => !ids.includes(getRowId(item)))
  emit('update:modelValue', [...internalData.value])
  emit('delete', ids)
  selectedRowIds.value.clear()
}

// 버튼 핸들러
const handleNew = () => {
  editingData.value = null
  if (props.formFields && props.formFields.length > 0) {
    isModalOpen.value = true
  } else {
    emit('new')
  }
}

const handleEdit = () => {
  if (selectedRowIds.value.size === 1) {
    const selectedId = Array.from(selectedRowIds.value)[0]
    const selectedItem = filteredData.value.find((item: any) => getRowId(item) === selectedId)
    if (selectedItem) {
      // 선택한 행 데이터를 모달에 넣기 위해 먼저 설정한 뒤 모달 오픈
      editingData.value = { ...selectedItem }
      if (props.formFields && props.formFields.length > 0) {
        nextTick(() => {
          isModalOpen.value = true
        })
      } else {
        emit('edit', editingData.value)
      }
    }
  }
}

const handleDelete = () => {
  if (selectedRowIds.value.size > 0) {
    pendingDeleteIds.value = Array.from(selectedRowIds.value)
    isDeleteConfirmOpen.value = true
  }
}

// 모달 핸들러
const handleModalClose = () => {
  isModalOpen.value = false
  editingData.value = null
}

const handleModalSubmit = (data: Record<string, any>) => {
  const isNew = !editingData.value
  pendingSubmit.value = true
  submitSnapshot.value = snapshotModelValue(props.modelValue)

  // 이벤트 emit (부모에서 실제 저장 처리)
  emit('update', data, isNew)
}

// 행 ID 가져오기
const getRowId = (row: any): string => {
  if (props.idField && row?.[props.idField]) {
    return String(row[props.idField])
  }
  // fallback: id 또는 key 필드 확인, 없으면 빈 문자열
  return String(row?.id || row?.key || '')
}

// 선택된 행 ID 관리
const selectedRowIds = ref<Set<string>>(new Set())

// 전체 선택 여부
const isAllSelected = computed(() => {
  return sortedRows.value.length > 0 && sortedRows.value.every(row => selectedRowIds.value.has(getRowId(row.original)))
})

// 행 선택 여부 확인
const isRowSelected = (id: string) => {
  return selectedRowIds.value.has(id)
}

// 행 선택/해제 (체크박스 change 시)
const handleRowSelect = (id: string, event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  if (checked) {
    selectedRowIds.value.add(id)
  } else {
    selectedRowIds.value.delete(id)
  }
  selectedRowIds.value = new Set(selectedRowIds.value)
}

// 행 클릭 시 체크박스 토글
const handleRowClick = (id: string) => {
  if (selectedRowIds.value.has(id)) {
    selectedRowIds.value.delete(id)
  } else {
    selectedRowIds.value.add(id)
  }
  selectedRowIds.value = new Set(selectedRowIds.value)
}

// 전체 선택/해제
const handleSelectAll = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  if (checked) {
    sortedRows.value.forEach(row => {
      selectedRowIds.value.add(getRowId(row.original))
    })
  } else {
    sortedRows.value.forEach(row => {
      selectedRowIds.value.delete(getRowId(row.original))
    })
  }
}

// 필터 드롭다운 토글
const isFilterButtonClicking = ref(false)

const toggleFilterDropdown = (columnId: string, event?: Event) => {
  isFilterButtonClicking.value = true
  
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  
  if (openFilterDropdown.value === columnId) {
    openFilterDropdown.value = null
  } else {
    openFilterDropdown.value = columnId
    if (!columnFilters.value[columnId]) {
      columnFilters.value[columnId] = { search: '' }
    }
  }
  
  setTimeout(() => {
    isFilterButtonClicking.value = false
  }, 100)
}

// 정렬 처리
const handleSort = (columnId: string, direction: 'asc' | 'desc' | false) => {
  if (direction === false) {
    sorting.value = []
  } else {
    sorting.value = [{ id: columnId, desc: direction === 'desc' }]
  }
}

// 필터 해제
const clearFilter = (columnId: string) => {
  sorting.value = sorting.value.filter(s => s.id !== columnId)
  if (columnFilters.value[columnId]) {
    columnFilters.value[columnId].search = ''
  }
}

// 컬럼 표시/숨김 토글
const toggleColumn = (columnId: string) => {
  const newSet = new Set(visibleColumns.value)
  if (newSet.has(columnId)) {
    newSet.delete(columnId)
  } else {
    newSet.add(columnId)
  }
  visibleColumns.value = newSet
  
  // 설정 저장
  if (props.preferenceKey) {
    preferenceStore.setTableColumns(props.preferenceKey, Array.from(newSet))
  }
}

// 헤더에 표시할 모든 컬럼
const visibleColumnsList = computed(() => {
  return props.columns.filter(col => visibleColumns.value.has(col.id))
})

// 내부 데이터 관리 (v-model과 동기화)
const internalData = ref([...props.modelValue])
const pendingSubmit = ref(false)
const submitSnapshot = ref('')
const lastModelSnapshot = ref('')

const snapshotModelValue = (value: any[]) => {
  try {
    return JSON.stringify(value ?? [])
  } catch {
    return ''
  }
}

// props.modelValue가 변경되면 내부 데이터도 업데이트
watch(
  () => props.modelValue,
  (newData) => {
    const currentSnapshot = snapshotModelValue(newData)
    if (lastModelSnapshot.value === '') {
      lastModelSnapshot.value = currentSnapshot
      internalData.value = [...newData]
      return
    }
    if (currentSnapshot !== lastModelSnapshot.value) {
      lastModelSnapshot.value = currentSnapshot
      internalData.value = [...newData]
      if (pendingSubmit.value && currentSnapshot !== submitSnapshot.value) {
        pendingSubmit.value = false
        submitSnapshot.value = ''
        handleModalClose()
        selectedRowIds.value.clear()
      }
    }
  },
  { deep: true, immediate: true }
)

// 필터링된 데이터
const filteredData = computed(() => {
  let filtered = [...internalData.value]
  
  // 각 컬럼별 검색 필터 적용
  Object.keys(columnFilters.value).forEach(columnId => {
    const filter = columnFilters.value[columnId]
    if (filter && filter.search && filter.search.trim()) {
      const searchTerm = filter.search.toLowerCase().trim()
      filtered = filtered.filter(row => {
        const value = row[columnId]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(searchTerm)
      })
    }
  })
  
  return filtered
})

// 데이터 개수 계산
const totalDataCount = computed(() => {
  return internalData.value.length
})

const filteredDataCount = computed(() => {
  return filteredData.value.length
})

// TanStack Table 컬럼 정의 생성
const tableColumns = computed<ColumnDef<any>[]>(() => {
  const cols: ColumnDef<any>[] = []
  
  // idField가 있을 때만 ID 컬럼 추가
  if (props.idField && props.idField.trim() !== '' && !props.hideIdColumn) {
    cols.push({
      accessorKey: props.idField,
      header: 'ID',
      size: props.idColumnWidth,
      enableSorting: true
    })
  }
  
  visibleColumnsList.value.forEach(col => {
    cols.push({
      accessorKey: col.id,
      header: col.header,
      size: col.size,
      enableSorting: col.enableSorting !== false
    })
  })
  
  return cols
})

// TanStack Table 인스턴스 생성
const table = useVueTable({
  get data() {
    return filteredData.value
  },
  get columns() {
    return tableColumns.value
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: {
    get sorting() {
      return sorting.value
    }
  },
  onSortingChange: (updater) => {
    if (typeof updater === 'function') {
      sorting.value = updater(sorting.value)
    } else {
      sorting.value = updater
    }
  }
})

// 컨테이너 너비 감지
const containerWidth = ref(0)

// 사용자가 리사이즈한 컬럼인지 (columnWidthsState에 값이 있으면 고정 픽셀 사용)
const hasUserSetWidth = (columnId: string) => columnWidthsState.value[columnId] !== undefined

// Grid 컬럼 너비 계산: 리사이즈한 컬럼은 지정 너비 유지, 나머지는 남은 공간을 비율로 분배. template 문자열과 총 너비 반환.
const gridColumnsState = computed(() => {
  const checkboxW = getColumnWidth('checkbox', props.checkboxColumnWidth)
  const hasIdColumn = props.idField && props.idField.trim() !== '' && !props.hideIdColumn
  const tableContainerW = containerWidth.value || 1200
  const availableWidth = Math.max(0, tableContainerW - checkboxW)

  const idMin = hasIdColumn ? getHeaderMinWidth(props.idField) : 0
  const idUserSet = hasIdColumn && hasUserSetWidth(props.idField)
  const idFixedW = hasIdColumn ? getColumnWidth(props.idField, props.idColumnWidth) : 0

  const visibleCols = visibleColumnsList.value
  const visibleFixed: number[] = []
  const visibleFlexDefault: number[] = []
  let fixedSum = idUserSet ? idFixedW : 0

  visibleCols.forEach((col, i) => {
    const minW = getHeaderMinWidth(col.id)
    if (hasUserSetWidth(col.id)) {
      const w = getColumnWidth(col.id, col.size)
      visibleFixed[i] = w
      visibleFlexDefault[i] = 0
      fixedSum += w
    } else {
      visibleFixed[i] = 0
      visibleFlexDefault[i] = Math.max(minW, col.size)
    }
  })

  const remaining = availableWidth - fixedSum
  const flexTotal = visibleFlexDefault.reduce((a, b) => a + b, 0) + (hasIdColumn && !idUserSet ? idFixedW || idMin : 0)
  const ratio = flexTotal > 0 ? Math.max(0, remaining) / flexTotal : 1

  const idW = hasIdColumn
    ? (idUserSet ? idFixedW : Math.max(idMin, (idFixedW || idMin) * ratio))
    : 0
  const visibleColumnWidths = visibleCols.map((col, i) =>
    visibleFixed[i] > 0
      ? visibleFixed[i]
      : Math.max(getHeaderMinWidth(col.id), visibleFlexDefault[i] * ratio)
  )

  const totalWidth = checkboxW + idW + visibleColumnWidths.reduce((a, b) => a + b, 0)
  const template = hasIdColumn
    ? `${checkboxW}px ${idW}px ${visibleColumnWidths.map(w => `${w}px`).join(' ')}`
    : `${checkboxW}px ${visibleColumnWidths.map(w => `${w}px`).join(' ')}`
  return { template, totalWidth }
})

const gridTemplateColumns = computed(() => gridColumnsState.value.template)

const effectiveTableWidth = computed(() => gridColumnsState.value.totalWidth)

// 컬럼 최소 너비를 지키면 테이블이 컨테이너보다 넓어질 때만 true
const needsHorizontalScroll = computed(() => {
  const cw = containerWidth.value
  return cw > 0 && effectiveTableWidth.value > cw
})

// 가상 스크롤 설정
const tableContainerRef = ref<HTMLElement | null>(null)

// 정렬된 행 데이터
const sortedRows = computed(() => {
  return table.getRowModel().rows
})

// sortedRows의 데이터 해시를 계산하여 virtualizer가 변경을 감지하도록 함
const getRowIdSafe = (row: any) => row ? getRowId(row) : ''

const sortedRowsHash = computed(() => {
  try {
    if (!sortedRows.value || sortedRows.value.length === 0) return 'empty'
    const first = sortedRows.value[0]?.original
    const last = sortedRows.value[sortedRows.value.length - 1]?.original
    
    const firstId = getRowIdSafe(first)
    const firstHq = first?.hq_code || ''
    const firstRoute = first?.route_code || ''
    const lastId = getRowIdSafe(last)
    const lastHq = last?.hq_code || ''
    const lastRoute = last?.route_code || ''
    
    return `${sortedRows.value.length}-${firstId}-${firstHq}-${firstRoute}-${lastId}-${lastHq}-${lastRoute}`
  } catch (error) {
    return 'error'
  }
})

const virtualizer = useVirtualizer({
  get count() {
    sortedRowsHash.value // Trigger dependency
    return sortedRows.value.length
  },
  getScrollElement: () => tableContainerRef.value,
  estimateSize: () => 40,
  overscan: 5,
  getItemKey: (index) => {
    const row = sortedRows.value[index]
    const rowId = getRowId(row?.original) || `item-${index}`
    const hash = sortedRowsHash.value || 'default'
    const dataHash = typeof hash === 'string' ? hash.substring(0, 8) : 'default'
    return `${rowId}-${dataHash}`
  }
})

// sortedRows가 변경되면 virtualizer를 강제로 업데이트
watch(
  () => sortedRowsHash.value,
  async () => {
    await nextTick()
    // virtualizer가 자동으로 재계산되도록 트리거
  },
  { immediate: true }
)

const updateContainerWidth = () => {
  if (tableContainerRef.value) {
    containerWidth.value = tableContainerRef.value.clientWidth
  }
}

let resizeObserver: ResizeObserver | null = null
let clickOutsideHandler: ((event: MouseEvent) => void) | null = null

onMounted(() => {
  clickOutsideHandler = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target) return
    
    // 1. 컬럼 선택 드롭다운 처리
    if (isColumnDropdownOpen.value && columnSelectorRef.value) {
      if (!columnSelectorRef.value.contains(target)) {
        isColumnDropdownOpen.value = false
      }
    }
    
    // 2. 필터 드롭다운 처리
    if (openFilterDropdown.value && !isFilterButtonClicking.value) {
      const isFilterRelated = target.closest('.filter-button') || target.closest('.filter-dropdown')
      if (!isFilterRelated) {
        openFilterDropdown.value = null
      }
    }
  }
  
  // 저장된 컬럼 설정 로드
  if (props.preferenceKey) {
    const savedColumns = preferenceStore.getTableColumns(props.preferenceKey)
    if (savedColumns) {
      visibleColumns.value = new Set(savedColumns)
    }
    const savedWidths = preferenceStore.getTableColumnWidths(props.preferenceKey)
    if (savedWidths && Object.keys(savedWidths).length > 0) {
      columnWidthsState.value = { ...savedWidths }
    }
  }
  
  setTimeout(() => {
    if (clickOutsideHandler) {
      document.addEventListener('click', clickOutsideHandler, true)
    }
  }, 0)
  
  updateContainerWidth()
  window.addEventListener('resize', updateContainerWidth)
  
  if (tableContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateContainerWidth()
    })
    resizeObserver.observe(tableContainerRef.value)
  }
})

onUnmounted(() => {
  if (clickOutsideHandler) {
    document.removeEventListener('click', clickOutsideHandler, true)
  }
  window.removeEventListener('resize', updateContainerWidth)
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(() => tableContainerRef.value, (el) => {
  if (el && resizeObserver) {
    resizeObserver.observe(el)
  }
}, { immediate: true })

// 선택된 행 ID를 외부에서 접근할 수 있도록 expose
defineExpose({
  selectedRowIds: computed(() => selectedRowIds.value)
})
</script>

<style scoped>
.reusable-table-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 0;
}

.table-container {
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  background-color: #ffffff;
  min-height: 0;
  flex: 1;
}

.table-wrapper {
  position: relative;
  width: 100%;
  min-width: 0;
}



.table-header {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 30;
  background-color: #f8fafc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.top-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 16px;
}

.data-count-info {
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.data-count-text {
  font-size: 0.875rem;
  color: #64748b;
  white-space: nowrap;
}

.data-count-text strong {
  color: #334155;
  font-weight: 600;
}

.filtered-count {
  color: #3b82f6;
  margin-left: 4px;
}

.filtered-count strong {
  color: #2563eb;
}

.toolbar-right {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  margin-left: auto;
}

.button-group {
  display: flex;
  gap: 16px;
}

.grid-header {
  display: grid;
  grid-template-rows: 40px;
  border-collapse: collapse;
  box-sizing: border-box;
}

.grid-header .header-cell {
  box-sizing: border-box;
  text-align: center;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: background-color 0.2s;
  overflow: visible;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.grid-header .header-cell.filtered {
  background-color: #dbeafe;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
}

.grid-row {
  display: grid;
  grid-template-rows: 40px;
  border-collapse: collapse;
  box-sizing: border-box;
}

.data-cell:not(.data-cell-id) {
  border-right: 1px solid #e2e8f0;
}

.data-cell-id {
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.sticky-checkbox-column {
  position: sticky;
  left: 0;
  z-index: 20;
}

.sticky-id-column {
  position: sticky;
  z-index: 20;
}

.table-header .sticky-checkbox-column {
  background-color: #f1f5f9 !important;
  z-index: 40;
  position: sticky;
  left: 0;
}

.table-header .sticky-id-column {
  background-color: #f1f5f9 !important;
  z-index: 40;
  position: sticky;
}

.table-header .sticky-id-column.filtered {
  background-color: #e2e8f0 !important;
}

.data-cell {
  box-sizing: border-box;
  text-align: center;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.table-body {
  position: relative;
  overflow: visible;
}

.data-item-wrapper {
  position: absolute;
  border-bottom: 2px solid #e2e8f0;
  cursor: pointer;
}

.data-item-even {
  background-color: #ffffff;
}

.data-item-odd {
  background-color: #f9fafb;
}

/* 컬럼 선택 드롭다운 스타일 */
.column-selector-container {
  display: flex;
  align-items: center;
}

.column-selector-wrapper {
  position: relative;
}

.column-selector-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s;
}

.column-selector-button:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

.dropdown-arrow {
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.column-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 100;
  min-width: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  font-size: 0.875rem;
  color: #334155;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f1f5f9;
}

.dropdown-content {
  padding: 8px;
}

.column-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-size: 0.875rem;
  color: #475569;
}

.column-checkbox-label:hover {
  background-color: #f1f5f9;
}

.column-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3b82f6;
}

/* 필터 버튼 및 드롭다운 스타일 */
.filter-button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
  margin-left: 4px;
  position: relative;
}

.filter-button:hover {
  background-color: #f1f5f9;
}

.filter-button.active {
  background-color: #e0f2fe;
  color: #2563eb;
}

.filter-icon {
  font-size: 0.75rem;
  line-height: 1;
}

.filter-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  min-width: 200px;
  max-width: 300px;
  padding: 12px;
  display: block !important;
}

.filter-section {
  margin-bottom: 12px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-option {
  padding: 6px 12px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  text-align: left;
  transition: all 0.2s;
}

.filter-option:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.filter-option.active {
  background-color: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

.filter-search-input {
  width: 100%;
  padding: 6px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.filter-search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-clear-button {
  width: 100%;
  padding: 8px 12px;
  background-color: #ef4444;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.filter-clear-button:hover:not(:disabled) {
  background-color: #dc2626;
}

.filter-clear-button:disabled {
  background-color: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
  opacity: 0.6;
}

.header-cell {
  position: relative;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.grid-header .header-cell.sticky-checkbox-column {
  padding: 0.75rem 0;
  min-width: 0;
}

.grid-header .header-cell.sticky-checkbox-column .header-content {
  justify-content: center;
  padding: 0;
  width: 100%;
}

.data-cell-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  padding: 0.75rem 0;
  min-width: 0;
}

.data-item-even .data-cell-checkbox {
  background-color: #ffffff;
}

.data-item-odd .data-cell-checkbox {
  background-color: #f9fafb;
}

/* 체크박스로 선택된 행 배경 */
.data-item-selected .data-cell,
.data-item-selected .data-cell-checkbox,
.data-item-selected .data-cell-id {
  background-color: #dbeafe !important;
}

.data-item-selected:hover .data-cell,
.data-item-selected:hover .data-cell-checkbox,
.data-item-selected:hover .data-cell-id {
  background-color: #bfdbfe !important;
}

.table-header .sticky-checkbox-column {
  background-color: #f1f5f9 !important;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
  background: transparent;
}

.resize-handle:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

.header-cell:hover .resize-handle {
  background-color: rgba(59, 130, 246, 0.1);
}

/* 버튼 관련 스타일은 Button.vue 컴포넌트에 포함되어 있음 */

/* 삭제 확인 모달 */
.delete-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
}

.delete-confirm-container {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 420px;
  overflow: hidden;
}

.delete-confirm-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.delete-confirm-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
}

.delete-confirm-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  flex: 1;
}

.delete-confirm-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.delete-confirm-close:hover {
  background-color: rgba(0, 0, 0, 0.06);
  color: #1e293b;
}

.delete-confirm-body {
  padding: 24px 20px;
}

.delete-confirm-message {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #334155;
  white-space: pre-wrap;
  word-break: break-word;
}

.delete-confirm-footer {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.delete-confirm-btn {
  min-width: 88px;
  padding: 10px 20px;
  font-size: 0.9375rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-confirm-btn.cancel {
  background-color: #f1f5f9;
  color: #475569;
}

.delete-confirm-btn.cancel:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

.delete-confirm-btn.confirm {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
}

.delete-confirm-btn.confirm:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
}

.delete-confirm-btn:active {
  transform: scale(0.98);
}

/* 삭제 확인 모달 트랜지션 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .delete-confirm-container,
.modal-leave-active .delete-confirm-container {
  transition: transform 0.2s ease;
}
.modal-enter-from .delete-confirm-container,
.modal-leave-to .delete-confirm-container {
  transform: scale(0.95);
}
</style>

