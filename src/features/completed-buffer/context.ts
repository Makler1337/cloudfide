import { createContext } from 'react'

import type { BasicInfo, ProjectDetails } from '../../domain/types'

export interface BufferValue {
  basicInfo: BasicInfo | null
  projectDetails: ProjectDetails | null
  setBasicInfo: (data: BasicInfo) => void
  setProjectDetails: (data: ProjectDetails) => void
  clear: () => void
  hasChanges: boolean
}

export const CompletedBufferContext = createContext<BufferValue | null>(null)
