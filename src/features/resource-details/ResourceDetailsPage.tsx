import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { Card } from '../../design-system'
import { useResource } from '../../hooks/resources'
import { useCompletedBuffer } from '../completed-buffer/useCompletedBuffer'
import { StatusBadge } from '../../shared/components/StatusBadge'
import { formatDateTime } from '../../shared/formatDate'
import type { BasicInfo, ProjectDetails } from '../../domain/types'

export function ResourceDetailsPage() {
  const { resourceId = '' } = useParams<{ resourceId: string }>()
  const resourceQuery = useResource(resourceId)
  const buffer = useCompletedBuffer()

  if (resourceQuery.isLoading) return <Notice>Loading…</Notice>
  if (resourceQuery.isError || !resourceQuery.data) {
    return (
      <Notice role="alert">
        {resourceQuery.error?.message ?? 'Resource not found.'}{' '}
        <Link to="/resources">Back to resources</Link>
      </Notice>
    )
  }

  const resource = resourceQuery.data
  const isCompleted = resource.status === 'completed'
  const showingBuffer = isCompleted && buffer.hasChanges

  const basicInfo: BasicInfo =
    isCompleted && buffer.basicInfo ? buffer.basicInfo : resource.basicInfo
  const projectDetails: ProjectDetails =
    isCompleted && buffer.projectDetails ? buffer.projectDetails : resource.projectDetails

  return (
    <Page>
      <BackLink to={`/resources/${resourceId}`}>← Back to overview</BackLink>

      <Header>
        <Title>{resource.name}</Title>
        <Meta>
          <StatusBadge status={resource.status} />
          <span>Created {formatDateTime(resource.createdAt)}</span>
          <span>Updated {formatDateTime(resource.updatedAt)}</span>
        </Meta>
      </Header>

      {showingBuffer ? (
        <Notice $tone="info">
          Showing pending edits. Save them on the overview page to persist.
        </Notice>
      ) : null}

      <Section>
        <SectionHeader>
          <h2>Basic Info</h2>
        </SectionHeader>
        <Card>
          <DefinitionList>
            <Row label="Resource name" value={basicInfo.resourceName} />
            <Row label="Owner" value={basicInfo.owner} />
            <Row label="Email" value={basicInfo.email} />
            <Row label="Description" value={basicInfo.description} multiline />
            <Row label="Priority" value={capitalize(basicInfo.priority)} />
          </DefinitionList>
        </Card>
      </Section>

      <Section>
        <SectionHeader>
          <h2>Project Details</h2>
        </SectionHeader>
        <Card>
          <DefinitionList>
            <Row label="Project name" value={projectDetails.projectName} />
            <Row label="Budget" value={projectDetails.budget} />
            <Row label="Category" value={capitalize(projectDetails.category)} />
            <Row
              label="Team members"
              value={
                projectDetails.options.length > 0
                  ? projectDetails.options.join(', ')
                  : ''
              }
            />
          </DefinitionList>
        </Card>
      </Section>
    </Page>
  )
}

function Row({
  label,
  value,
  multiline,
}: {
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <RowWrapper>
      <Term>{label}</Term>
      <Definition $multiline={multiline}>{value || '—'}</Definition>
    </RowWrapper>
  )
}

function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : ''
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

const BackLink = styled(Link)`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.875rem;

  &:hover {
    color: ${({ theme }) => theme.colors.ink};
  }
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

const Title = styled.h1`
  font-size: 2rem;
`

const Meta = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.875rem;
  flex-wrap: wrap;
`

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const SectionHeader = styled.div`
  h2 {
    font-size: 1.125rem;
  }
`

const DefinitionList = styled.dl`
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  margin: 0;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xs};
  }
`

const RowWrapper = styled.div`
  display: contents;
`

const Term = styled.dt`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.875rem;
`

const Definition = styled.dd<{ $multiline?: boolean }>`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkStrong};
  white-space: ${({ $multiline }) => ($multiline ? 'pre-wrap' : 'normal')};
  word-break: break-word;
`

const Notice = styled.div<{ $tone?: 'info' }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $tone, theme }) =>
    $tone === 'info' ? theme.colors.accentSoft : 'transparent'};
  color: ${({ theme }) => theme.colors.inkStrong};
  text-align: ${({ $tone }) => ($tone ? 'left' : 'center')};
`
