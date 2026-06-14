import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Badge, Button, Card } from '../../design-system'
import { useProvisionResource, useResource } from '../../hooks/resources'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { StatusBadge } from '../../shared/components/StatusBadge'
import { formatDateTime } from '../../shared/formatDate'
import {
  canProvision,
  isBasicInfoComplete,
  isProjectDetailsComplete,
} from '../../domain/completion'
import { ApiError } from '../../api/errors'

export function ResourceOverviewPage() {
  const { resourceId = '' } = useParams<{ resourceId: string }>()
  const resourceQuery = useResource(resourceId)
  const provisionMutation = useProvisionResource(resourceId)
  const [isProvisionConfirmOpen, setProvisionConfirmOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (resourceQuery.isLoading) {
    return <Notice>Loading resource…</Notice>
  }

  if (resourceQuery.isError || !resourceQuery.data) {
    return (
      <Notice role="alert">
        {resourceQuery.error?.message ?? 'Resource not found.'}{' '}
        <Link to="/resources">Back to resources</Link>
      </Notice>
    )
  }

  const resource = resourceQuery.data
  const isDraft = resource.status === 'draft'
  const basicInfoDone = isBasicInfoComplete(resource.basicInfo)
  const projectDetailsDone = isProjectDetailsComplete(resource.projectDetails)
  const projectDetailsLocked = isDraft && !basicInfoDone

  const handleProvision = async () => {
    setActionError(null)
    try {
      await provisionMutation.mutateAsync()
      setProvisionConfirmOpen(false)
    } catch (error) {
      setActionError(toMessage(error, 'Failed to provision resource'))
    }
  }

  return (
    <Page>
      <BackLink to="/resources">← All resources</BackLink>

      <Header>
        <div>
          <Title>{resource.name}</Title>
          <Meta>
            <StatusBadge status={resource.status} />
            <span>ID #{resource.resourceId}</span>
            <span>Updated {formatDateTime(resource.updatedAt)}</span>
          </Meta>
        </div>
        <Link to={`/resources/${resourceId}/details`}>
          <Button variant="secondary">View details</Button>
        </Link>
      </Header>

      {actionError ? <ErrorBanner role="alert">{actionError}</ErrorBanner> : null}

      <Modules>
        <ModuleCard
          title="Basic Info"
          done={basicInfoDone}
          editHref={`/resources/${resourceId}/basic-info`}
          editLabel={basicInfoDone ? 'Edit' : 'Fill in'}
        />
        <ModuleCard
          title="Project Details"
          done={projectDetailsDone}
          locked={projectDetailsLocked}
          lockedReason="Complete Basic Info first"
          editHref={`/resources/${resourceId}/project-details`}
          editLabel={projectDetailsDone ? 'Edit' : 'Fill in'}
        />
      </Modules>

      {isDraft ? (
        <DraftActions>
          <Button
            disabled={!canProvision(resource) || provisionMutation.isPending}
            onClick={() => setProvisionConfirmOpen(true)}
          >
            {provisionMutation.isPending ? 'Provisioning…' : 'Provision resource'}
          </Button>
          {!canProvision(resource) ? (
            <HelperLine>Complete both modules to enable provisioning.</HelperLine>
          ) : null}
        </DraftActions>
      ) : null}

      <ConfirmDialog
        isOpen={isProvisionConfirmOpen}
        title="Provision resource"
        description="Marking this resource as completed cannot be undone."
        confirmLabel="Provision"
        isLoading={provisionMutation.isPending}
        onCancel={() => setProvisionConfirmOpen(false)}
        onConfirm={handleProvision}
      />
    </Page>
  )
}

interface ModuleCardProps {
  title: string
  done: boolean
  locked?: boolean
  lockedReason?: string
  editHref: string
  editLabel: string
}

function ModuleCard({
  title,
  done,
  locked,
  lockedReason,
  editHref,
  editLabel,
}: ModuleCardProps) {
  return (
    <Card>
      <ModuleHeader>
        <h2>{title}</h2>
        <Badge variant={done ? 'success' : locked ? 'neutral' : 'warning'}>
          {locked ? 'Locked' : done ? 'Complete' : 'Incomplete'}
        </Badge>
      </ModuleHeader>
      {locked ? <LockedHint>{lockedReason}</LockedHint> : null}
      <ModuleActions>
        {locked ? (
          <Button state="locked" disabled>
            {editLabel}
          </Button>
        ) : (
          <Link to={editHref}>
            <Button variant={done ? 'secondary' : 'primary'}>{editLabel}</Button>
          </Link>
        )}
      </ModuleActions>
    </Card>
  )
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
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`

const Title = styled.h1`
  font-size: 2rem;
`

const Meta = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xs};
  align-items: center;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.875rem;
  flex-wrap: wrap;
`

const ErrorBanner = styled.div`
  background: rgba(180, 71, 27, 0.08);
  color: ${({ theme }) => theme.colors.warning};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
`

const Modules = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

const ModuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  h2 {
    font-size: 1.125rem;
  }
`

const ModuleActions = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: flex-end;
`

const LockedHint = styled.p`
  margin-top: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.875rem;
`

const DraftActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xs};
`

const HelperLine = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.875rem;
`

const Notice = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.inkMuted};
`
