import { z } from 'zod'

// Regexes mirror backend validation (backend/src/modules/resources/resource.service.ts).
const NAME_REGEX = /^[A-Za-z0-9 -]+$/
const OWNER_REGEX = /^[A-Za-z ]+$/
const INTEGER_REGEX = /^\d+$/

export const PRIORITY_VALUES = ['low', 'medium', 'high'] as const
export const CATEGORY_VALUES = ['internal', 'external', 'vendor'] as const
export const TEAM_MEMBER_VALUES = [
  'FE devs',
  'BE devs',
  'Designer',
  'Data Eng',
  'Product Owner',
] as const

export const resourceStatusSchema = z.enum(['draft', 'completed'])

export const resourceNameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(255, 'Name must be at most 255 characters')
  .regex(NAME_REGEX, 'Only letters, numbers, spaces, and hyphens are allowed')

// Read shapes: backend stores empty strings for unset fields, so reads are permissive.
export const apiBasicInfoSchema = z.object({
  resourceName: z.string(),
  owner: z.string(),
  email: z.string(),
  description: z.string(),
  priority: z.string(),
})

export const apiProjectDetailsSchema = z.object({
  projectName: z.string(),
  budget: z.string(),
  category: z.string(),
  options: z.array(z.string()),
})

export const apiResourceSchema = z.object({
  _id: z.string(),
  resourceId: z.number(),
  name: z.string(),
  status: resourceStatusSchema,
  basicInfo: apiBasicInfoSchema,
  projectDetails: apiProjectDetailsSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

// Form schemas validate user input strictly while keeping field types as `string`
// so empty defaults (for unfilled draft resources) are representable in form state.
const priorityField = z
  .string()
  .refine((value) => (PRIORITY_VALUES as readonly string[]).includes(value), {
    message: 'Pick a priority',
  })

const categoryField = z
  .string()
  .refine((value) => (CATEGORY_VALUES as readonly string[]).includes(value), {
    message: 'Pick a category',
  })

const teamMembersField = z
  .array(z.string())
  .min(1, 'Pick at least one team member')
  .refine(
    (values) =>
      values.every((value) =>
        (TEAM_MEMBER_VALUES as readonly string[]).includes(value),
      ),
    { message: 'Unsupported team member option' },
  )

export const basicInfoFormSchema = z.object({
  resourceName: resourceNameSchema,
  owner: z
    .string()
    .trim()
    .min(1, 'Owner is required')
    .max(255, 'Owner must be at most 255 characters')
    .regex(OWNER_REGEX, 'Only letters and spaces are allowed'),
  email: z.email('Enter a valid email address'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(1000, 'Description must be at most 1000 characters'),
  priority: priorityField,
})

export const projectDetailsFormSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(255, 'Project name must be at most 255 characters')
    .regex(NAME_REGEX, 'Only letters, numbers, spaces, and hyphens are allowed'),
  budget: z
    .string()
    .trim()
    .min(1, 'Budget is required')
    .regex(INTEGER_REGEX, 'Budget must be a whole number'),
  category: categoryField,
  options: teamMembersField,
})

export const createResourceFormSchema = z.object({
  resourceName: resourceNameSchema,
})
