import { defineStore } from 'pinia'

interface PreferenceState {
    tableColumns: Record<string, string[]> // key: tableId, value: visible column ids
    tableColumnWidths: Record<string, Record<string, number>> // key: tableId, value: columnId -> width
}

const STORAGE_KEY = 'vms_table_preferences'
const STORAGE_KEY_WIDTHS = 'vms_table_column_widths'

export const usePreferenceStore = defineStore('preference', {
    state: (): PreferenceState => ({
        tableColumns: JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'),
        tableColumnWidths: JSON.parse(localStorage.getItem(STORAGE_KEY_WIDTHS) || '{}')
    }),

    actions: {
        setTableColumns(tableId: string, columns: string[]) {
            this.tableColumns[tableId] = columns
            this.saveToStorage()
        },

        getTableColumns(tableId: string): string[] | null {
            return this.tableColumns[tableId] || null
        },

        setTableColumnWidths(tableId: string, widths: Record<string, number>) {
            this.tableColumnWidths[tableId] = { ...widths }
            this.saveWidthsToStorage()
        },

        getTableColumnWidths(tableId: string): Record<string, number> | null {
            return this.tableColumnWidths[tableId] || null
        },

        saveToStorage() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tableColumns))
        },

        saveWidthsToStorage() {
            localStorage.setItem(STORAGE_KEY_WIDTHS, JSON.stringify(this.tableColumnWidths))
        }
    }
})
