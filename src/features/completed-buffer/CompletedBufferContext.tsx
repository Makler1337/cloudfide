import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { BasicInfo, ProjectDetails } from '../../domain/types'
import { CompletedBufferContext, type BufferValue } from './context'

interface ProviderProps {
  children: ReactNode
}

// Holds buffered module edits for a completed resource.
// Intentionally non-persistent: lives in memory only, lost on refresh or navigation
// to a different resource (the provider is keyed by resourceId in ResourceLayout).
export function CompletedBufferProvider({ children }: ProviderProps) {
  const [basicInfo, setBasicInfoState] = useState<BasicInfo | null>(null)
  const [projectDetails, setProjectDetailsState] = useState<ProjectDetails | null>(null)

  const setBasicInfo = useCallback((data: BasicInfo) => setBasicInfoState(data), [])
  const setProjectDetails = useCallback(
    (data: ProjectDetails) => setProjectDetailsState(data),
    [],
  )
  const clear = useCallback(() => {
    setBasicInfoState(null)
    setProjectDetailsState(null)
  }, [])

  const value = useMemo<BufferValue>(
    () => ({
      basicInfo,
      projectDetails,
      setBasicInfo,
      setProjectDetails,
      clear,
      hasChanges: basicInfo !== null || projectDetails !== null,
    }),
    [basicInfo, projectDetails, setBasicInfo, setProjectDetails, clear],
  )

  return (
    <CompletedBufferContext.Provider value={value}>
      {children}
    </CompletedBufferContext.Provider>
  )
}
