import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Badge, Button, Card } from '../../design-system'
import {
  useProvisionResource,
  useReplaceResource,
  useResource,
} from '../../hooks/resources'
import { useCompletedBuffer } from '../completed-buffer/useCompletedBuffer'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { StatusBadge } from '../../shared/components/StatusBadge'
import { formatDateTime } from '../../shared/formatDate'
import {
  canProvision,
  isBasicInfoComplete,
  isProjectDetailsComplete,
} from '../../domain/completion'
import { ApiError } from '../../api/errors'
import type { Resource } from '../../domain/types'

export function ResourceOverviewPage() {
  const { resourceId = '' } = useParams<{ resourceId: string }>()
  const navigate = useNavigate()
  const resourceQuery = useResource(resourceId)
  const buffer = useCompletedBuffer()
  const provisionMutation = useProvisionResource(resourceId)
  const replaceMutation = useReplaceResource(resourceId)
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
  const isCompleted = resource.status === 'completed'
  const basicInfoDone = isBasicInfoComplete(resource.basicInfo)
  const projectDetailsDone = isProjectDetailsComplete(resource.projectDetails)
  const projectDetailsLocked = isDraft && !basicInfoDone

  const handleProvision = async () => {
    // Close the dialog before awaiting so a fast double-click on Confirm
    // cannot enqueue a second mutation (the button is gone by then).
    setProvisionConfirmOpen(false)
    setActionError(null)
    try {
      await provisionMutation.mutateAsync()
      navigate('/resources')
    } catch (error) {
      setActionError(toMessage(error, 'Failed to provision resource'))
    }
  }

  const handleSaveBuffer = async () => {
    setActionError(null)
    try {
      const payload = buildReplacePayload(resource, buffer.basicInfo, buffer.projectDetails)
      await replaceMutation.mutateAsync(payload)
      buffer.clear()
    } catch (error) {
      setActionError(toMessage(error, 'Failed to save changes'))
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
            <span>Updated {formatDateTime(resource.updatedAt)}</span>
          </Meta>
        </div>
        <Link to={`/resources/${resourceId}/details`}>
          <Button variant="secondary">View details</Button>
        </Link>
      </Header>

      {isCompleted && buffer.hasChanges ? (
        <BufferBanner role="status">
          <div>
            <strong>Unsaved changes</strong>
            <p>
              Edits are kept locally until you save. They will be lost if you refresh the
              page.
            </p>
          </div>
          <BufferActions>
            <Button
              variant="secondary"
              onClick={buffer.clear}
              disabled={replaceMutation.isPending}
            >
              Discard
            </Button>
            <Button onClick={handleSaveBuffer} disabled={replaceMutation.isPending}>
              {replaceMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </BufferActions>
        </BufferBanner>
      ) : null}

      {actionError ? <ErrorBanner role="alert">{actionError}</ErrorBanner> : null}

      <Modules>
        <ModuleCard
          title="Basic Info"
          done={basicInfoDone}
          buffered={isCompleted && buffer.basicInfo !== null}
          editHref={`/resources/${resourceId}/basic-info`}
          editLabel={basicInfoDone ? 'Edit' : 'Fill in'}
        />
        <ModuleCard
          title="Project Details"
          done={projectDetailsDone}
          buffered={isCompleted && buffer.projectDetails !== null}
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
  buffered?: boolean
  locked?: boolean
  lockedReason?: string
  editHref: string
  editLabel: string
}

function ModuleCard({
  title,
  done,
  buffered,
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
      {buffered ? <BufferedHint>Has unsaved changes</BufferedHint> : null}
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

function buildReplacePayload(
  resource: Resource,
  bufferedBasicInfo: Resource['basicInfo'] | null,
  bufferedProjectDetails: Resource['projectDetails'] | null,
) {
  const basicInfo = bufferedBasicInfo ?? resource.basicInfo
  const projectDetails = bufferedProjectDetails ?? resource.projectDetails
  return {
    name: basicInfo.resourceName || resource.name,
    basicInfo,
    projectDetails,
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

const BufferBanner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.accentSoft};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  flex-wrap: wrap;

  strong {
    color: ${({ theme }) => theme.colors.inkStrong};
  }

  p {
    color: ${({ theme }) => theme.colors.inkMuted};
    font-size: 0.875rem;
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`

const BufferActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
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

const BufferedHint = styled.p`
  margin-top: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.accent};
  font-size: 0.875rem;
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
