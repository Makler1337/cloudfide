import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Card } from '../../design-system'
import { useResource, useUpdateBasicInfo } from '../../hooks/resources'
import { ApiError } from '../../api/errors'
import type { BasicInfo, BasicInfoFormValues } from '../../domain/types'
import { BasicInfoForm } from './BasicInfoForm'

export function BasicInfoPage() {
  const { resourceId = '' } = useParams<{ resourceId: string }>()
  const navigate = useNavigate()
  const resourceQuery = useResource(resourceId)
  const updateMutation = useUpdateBasicInfo(resourceId)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const overviewHref = `/resources/${resourceId}`

  const initialValues = useMemo<BasicInfoFormValues | null>(() => {
    if (!resourceQuery.data) return null
    return toFormValues(resourceQuery.data.basicInfo)
  }, [resourceQuery.data])

  if (resourceQuery.isLoading) return <Notice>Loading…</Notice>
  if (resourceQuery.isError || !resourceQuery.data || !initialValues) {
    return (
      <Notice role="alert">
        {resourceQuery.error?.message ?? 'Resource not found.'}{' '}
        <Link to="/resources">Back to resources</Link>
      </Notice>
    )
  }

  const handleSubmit = async (values: BasicInfoFormValues) => {
    setSubmitError(null)
    try {
      await updateMutation.mutateAsync(values)
      navigate(overviewHref)
    } catch (error) {
      setSubmitError(toMessage(error, 'Failed to save Basic Info'))
    }
  }

  return (
    <Page>
      <BackLink to={overviewHref}>← Back to overview</BackLink>
      <Heading>
        <h1>Basic Info</h1>
        <Subtitle>Fill in Basic Info to unlock Project Details.</Subtitle>
      </Heading>
      <FormCard>
        <BasicInfoForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate(overviewHref)}
          submitLabel="Save"
          submitError={submitError}
        />
      </FormCard>
    </Page>
  )
}

function toFormValues(basicInfo: BasicInfo): BasicInfoFormValues {
  return {
    resourceName: basicInfo.resourceName,
    owner: basicInfo.owner,
    email: basicInfo.email,
    description: basicInfo.description,
    priority: basicInfo.priority,
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
