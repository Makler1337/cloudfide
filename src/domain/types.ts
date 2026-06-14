import type { z } from 'zod'

import type {
  apiBasicInfoSchema,
  apiProjectDetailsSchema,
  apiResourceSchema,
  basicInfoFormSchema,
  createResourceFormSchema,
  projectDetailsFormSchema,
  resourceStatusSchema,
} from './schemas'

export type ResourceStatus = z.infer<typeof resourceStatusSchema>
export type BasicInfo = z.infer<typeof apiBasicInfoSchema>
export type ProjectDetails = z.infer<typeof apiProjectDetailsSchema>
export type Resource = z.infer<typeof apiResourceSchema>

export type BasicInfoFormValues = z.infer<typeof basicInfoFormSchema>
export type ProjectDetailsFormValues = z.infer<typeof projectDetailsFormSchema>
export type CreateResourceFormValues = z.infer<typeof createResourceFormSchema>
