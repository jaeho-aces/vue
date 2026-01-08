// 전역 타입 정의

export interface User {
  id: string
  name: string
  email: string
  role?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export type { FormField } from './form'



