import { apiRequest, type SearchParams } from './client'
import type {
  BasicInfo,
  ProjectDetails,
  Resource,
} from '../domain/types'
import type {
  ProvisioningResponse,
  ResourcesListQuery,
  ResourcesListResponse,
} from './types'

export interface ResourcePayload {
  name: string
  basicInfo: BasicInfo
  projectDetails: ProjectDetails
}

const resourcePath = (id: string) => `/api/resources/${id}`

export function listResources(
  query: ResourcesListQuery = {},
  signal?: AbortSignal,
): Promise<ResourcesListResponse> {
  return apiRequest<ResourcesListResponse>('/api/resources', {
    searchParams: query as SearchParams,
    signal,
  })
}

export function getResource(id: string, signal?: AbortSignal): Promise<Resource> {
  return apiRequest<Resource>(resourcePath(id), { signal })
}

export function createResource(resourceName: string): Promise<Resource> {
  return apiRequest<Resource>('/api/resources', {
    method: 'POST',
    body: { resourceName },
  })
}

export function updateBasicInfo(id: string, data: BasicInfo): Promise<Resource> {
  return apiRequest<Resource>(`${resourcePath(id)}/basic-info`, {
    method: 'PATCH',
    body: data,
  })
}

export function updateProjectDetails(
  id: string,
  data: ProjectDetails,
): Promise<Resource> {
  return apiRequest<Resource>(`${resourcePath(id)}/project-details`, {
    method: 'PATCH',
    body: data,
  })
}

export function provisionResource(id: string): Promise<ProvisioningResponse> {
  return apiRequest<ProvisioningResponse>(`${resourcePath(id)}/provisioning`, {
    method: 'PATCH',
  })
}

export function replaceResource(id: string, data: ResourcePayload): Promise<Resource> {
  return apiRequest<Resource>(resourcePath(id), {
    method: 'PUT',
    body: data,
  })
}

export function deleteResource(id: string): Promise<Resource> {
  return apiRequest<Resource>(resourcePath(id), { method: 'DELETE' })
}
