import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createResource,
  deleteResource,
  getResource,
  listResources,
  provisionResource,
  replaceResource,
  updateBasicInfo,
  updateProjectDetails,
  type ResourcePayload,
} from '../api/resources'
import { resourceKeys } from '../api/queryKeys'
import type { ResourcesListQuery } from '../api/types'
import type { BasicInfo, ProjectDetails, Resource } from '../domain/types'

export function useResourcesList(query: ResourcesListQuery) {
  return useQuery({
    queryKey: resourceKeys.list(query),
    queryFn: ({ signal }) => listResources(query, signal),
    placeholderData: (previous) => previous,
  })
}

export function useResource(id: string | undefined) {
  return useQuery({
    queryKey: resourceKeys.detail(id ?? ''),
    queryFn: ({ signal }) => getResource(id as string, signal),
    enabled: Boolean(id),
    // Always refetch on mount so navigating list -> detail can't show a stale
    // status (e.g. a resource provisioned moments ago). Cached data still
    // renders immediately; the refetch updates in the background.
    refetchOnMount: 'always',
  })
}

export function useCreateResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (resourceName: string) => createResource(resourceName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
  })
}

export function useDeleteResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteResource(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: resourceKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
  })
}

export function useUpdateBasicInfo(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BasicInfo) => updateBasicInfo(id, data),
    onSuccess: (resource) => syncResourceCaches(queryClient, id, resource),
  })
}

export function useUpdateProjectDetails(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProjectDetails) => updateProjectDetails(id, data),
    onSuccess: (resource) => syncResourceCaches(queryClient, id, resource),
  })
}

export function useProvisionResource(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => provisionResource(id),
    onSuccess: ({ resource }) => syncResourceCaches(queryClient, id, resource),
    // If the server rejects (e.g. a racing double-fire that already completed
    // the resource), refetch so the UI reflects the truth instead of stale state.
    onError: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.detail(id) })
    },
  })
}

export function useReplaceResource(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ResourcePayload) => replaceResource(id, data),
    onSuccess: (resource) => syncResourceCaches(queryClient, id, resource),
    onError: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.detail(id) })
    },
  })
}

type QueryClient = ReturnType<typeof useQueryClient>

function syncResourceCaches(queryClient: QueryClient, id: string, resource: Resource) {
  queryClient.setQueryData(resourceKeys.detail(id), resource)
  queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
}
