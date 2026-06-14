import type { BasicInfo, ProjectDetails, Resource } from './types'

export function isBasicInfoComplete(basicInfo: BasicInfo): boolean {
  return Boolean(
    basicInfo.resourceName &&
      basicInfo.owner &&
      basicInfo.email &&
      basicInfo.description &&
      basicInfo.priority,
  )
}

export function isProjectDetailsComplete(projectDetails: ProjectDetails): boolean {
  return Boolean(
    projectDetails.projectName &&
      projectDetails.budget &&
      projectDetails.category &&
      projectDetails.options.length > 0,
  )
}

export function canProvision(resource: Resource): boolean {
  return (
    resource.status === 'draft' &&
    isBasicInfoComplete(resource.basicInfo) &&
    isProjectDetailsComplete(resource.projectDetails)
  )
}
