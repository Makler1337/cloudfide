import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { Card } from '../../design-system'
import { useResource, useUpdateProjectDetails } from '../../hooks/resources'
import { useCompletedBuffer } from '../completed-buffer/useCompletedBuffer'
import { ApiError } from '../../api/errors'
import { isBasicInfoComplete } from '../../domain/completion'
import type { ProjectDetails, ProjectDetailsFormValues } from '../../domain/types'
import { ProjectDetailsForm } from './ProjectDetailsForm'

export function ProjectDetailsPage() {
  const { resourceId = '' } = useParams<{ resourceId: string }>()
  const navigate = useNavigate()
  const resourceQuery = useResource(resourceId)
  const buffer = useCompletedBuffer()
  const updateMutation = useUpdateProjectDetails(resourceId)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const overviewHref = `/resources/${resourceId}`

  const initialValues = useMemo<ProjectDetailsFormValues | null>(() => {
    if (!resourceQuery.data) return null
    const source =
      resourceQuery.data.status === 'completed' && buffer.projectDetails
        ? buffer.projectDetails
        : resourceQuery.data.projectDetails
    return toFormValues(source)
  }, [resourceQuery.data, buffer.projectDetails])

  // Mirror the backend rule: in draft mode, this form is gated until Basic Info is done.
  const isLockedInDraft = useMemo(() => {
    if (!resourceQuery.data) return false
    return (
      resourceQuery.data.status === 'draft' &&
      !isBasicInfoComplete(resourceQuery.data.basicInfo)
    )
  }, [resourceQuery.data])

  useEffect(() => {
    if (isLockedInDraft) {
      navigate(overviewHref, { replace: true })
    }
  }, [isLockedInDraft, navigate, overviewHref])

  if (resourceQuery.isLoading) return <Notice>Loading…</Notice>
  if (resourceQuery.isError || !resourceQuery.data || !initialValues) {
    return (
      <Notice role="alert">
        {resourceQuery.error?.message ?? 'Resource not found.'}{' '}
        <Link to="/resources">Back to resources</Link>
      </Notice>
    )
  }
  if (isLockedInDraft) return null

  const isCompleted = resourceQuery.data.status === 'completed'

  const handleSubmit = async (values: ProjectDetailsFormValues) => {
    setSubmitError(null)
    if (isCompleted) {
      buffer.setProjectDetails(values)
      navigate(overviewHref)
      return
    }
    try {
      await updateMutation.mutateAsync(values)
      navigate(overviewHref)
    } catch (error) {
      setSubmitError(toMessage(error, 'Failed to save Project Details'))
    }
  }

  return (
    <Page>
      <BackLink to={overviewHref}>← Back to overview</BackLink>
      <Heading>
        <h1>Project Details</h1>
        <Subtitle>
          {isCompleted
            ? 'Editing a completed resource — changes stay local until you save on the overview page.'
            : 'Fill in the project details to enable provisioning.'}
        </Subtitle>
      </Heading>
      <FormCard>
        <ProjectDetailsForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate(overviewHref)}
          submitLabel={isCompleted ? 'Apply' : 'Save'}
          submitError={submitError}
        />
      </FormCard>
    </Page>
  )
}

function toFormValues(projectDetails: ProjectDetails): ProjectDetailsFormValues {
  return {
    projectName: projectDetails.projectName,
    budget: projectDetails.budget,
    category: projectDetails.category,
    options: projectDetails.options,
  }
}

function toMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return fallback
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 720px;
  width: 100%;
`

const BackLink = styled(Link)`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.875rem;
  &:hover {
    color: ${({ theme }) => theme.colors.ink};
  }
`

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  h1 {
    font-size: 1.75rem;
  }
`

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.inkMuted};
`

const FormCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
`

const Notice = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.inkMuted};
`
