import type { Resource, ResourceStatus } from '../domain/types'

export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ResourcesListResponse {
  items: Resource[]
  pagination: Pagination
}

export interface ResourcesListQuery {
  page?: number
  pageSize?: number
  status?: ResourceStatus
  name?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ProvisioningResponse {
  alreadyCompleted: boolean
  resource: Resource
}
