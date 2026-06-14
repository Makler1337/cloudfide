import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Card, IconButton, Input, Select } from '../../design-system'
import { useDeleteResource, useResourcesList } from '../../hooks/resources'
import { useDebounce } from '../../shared/hooks/useDebounce'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { StatusBadge } from '../../shared/components/StatusBadge'
import { PriorityBadge } from '../../shared/components/PriorityBadge'
import { formatDateTime } from '../../shared/formatDate'
import type { Resource, ResourceStatus } from '../../domain/types'
import type { ResourcesListQuery } from '../../api/types'
import { CreateResourceDrawer } from './CreateResourceDrawer'

const PAGE_SIZE = 10
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Completed' },
]
const SORT_OPTIONS = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
]

export function ResourcesListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [pendingDeletion, setPendingDeletion] = useState<Resource | null>(null)
  const [isCreateOpen, setCreateOpen] = useState(false)

  const query = useMemo<ResourcesListQuery>(
    () => ({
      page: parsePage(searchParams.get('page')),
      pageSize: PAGE_SIZE,
      status: parseStatus(searchParams.get('status')),
      name: searchParams.get('name')?.trim() || undefined,
      sortOrder: parseSort(searchParams.get('sort')),
    }),
    [searchParams],
  )

  const [searchInput, setSearchInput] = useState(query.name ?? '')
  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    const next = debouncedSearch.trim()
    if ((next || undefined) === query.name) return
    updateParams(setSearchParams, { name: next || null, page: '1' })
  }, [debouncedSearch, query.name, setSearchParams])

  const resourcesQuery = useResourcesList(query)
  const deleteMutation = useDeleteResource()

  const items = resourcesQuery.data?.items ?? []
  const pagination = resourcesQuery.data?.pagination
  const isLoading = resourcesQuery.isLoading
  const isError = resourcesQuery.isError

  const handleDelete = async () => {
    if (!pendingDeletion) return
    await deleteMutation.mutateAsync(pendingDeletion._id)
    setPendingDeletion(null)
  }

  return (
    <Page>
      <Header>
        <div>
          <Title>Resources</Title>
          <Subtitle>Create and manage resources through the workflow.</Subtitle>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ New resource</Button>
      </Header>

      <Filters>
        <Input
          aria-label="Search by name"
          placeholder="Search by name"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <Select
          aria-label="Status filter"
          options={STATUS_OPTIONS}
          value={query.status ?? ''}
          onChange={(event) =>
            updateParams(setSearchParams, {
              status: event.target.value || null,
              page: '1',
            })
          }
        />
        <Select
          aria-label="Sort order"
          options={SORT_OPTIONS}
          value={query.sortOrder ?? 'desc'}
          onChange={(event) =>
            updateParams(setSearchParams, { sort: event.target.value, page: '1' })
          }
        />
      </Filters>

      <Card>
        {isError ? (
          <Notice role="alert">
            Failed to load resources. {resourcesQuery.error?.message ?? ''}
          </Notice>
        ) : isLoading ? (
          <Notice>Loading resources…</Notice>
        ) : items.length === 0 ? (
          <EmptyState>
            <strong>No resources found.</strong>
            <span>Try adjusting filters or create a new one.</span>
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Updated</th>
                <Th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {items.map((resource) => (
                <tr key={resource._id}>
                  <td>
                    <NameLink to={`/resources/${resource._id}`}>
                      {resource.name}
                    </NameLink>
                  </td>
                  <td>
                    <StatusBadge status={resource.status} />
                  </td>
                  <td>
                    <PriorityBadge priority={resource.basicInfo.priority} />
                  </td>
                  <td>{formatDateTime(resource.createdAt)}</td>
                  <td>{formatDateTime(resource.updatedAt)}</td>
                  <td>
                    <RowActions>
                      <IconButton
                        type="button"
                        variant="ghost"
                        aria-label={`Delete ${resource.name}`}
                        onClick={() => setPendingDeletion(resource)}
                      >
                        ✕
                      </IconButton>
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {pagination ? (
        <Footer>
          <span>
            Showing {(pagination.page - 1) * pagination.pageSize + (items.length > 0 ? 1 : 0)}
            –{(pagination.page - 1) * pagination.pageSize + items.length} of{' '}
            {pagination.totalItems}
          </span>
          <Pagination>
            <Button
              variant="secondary"
              size="small"
              disabled={pagination.page <= 1}
              onClick={() =>
                updateParams(setSearchParams, { page: String(pagination.page - 1) })
              }
            >
              Previous
            </Button>
            <PageIndicator>
              Page {pagination.page} of {pagination.totalPages}
            </PageIndicator>
            <Button
              variant="secondary"
              size="small"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                updateParams(setSearchParams, { page: String(pagination.page + 1) })
              }
            >
              Next
            </Button>
          </Pagination>
        </Footer>
      ) : null}

      <CreateResourceDrawer
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
      />

      <ConfirmDialog
        isOpen={pendingDeletion !== null}
        title="Delete resource"
        description={
          pendingDeletion
            ? `Delete "${pendingDeletion.name}"? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={handleDelete}
      />
    </Page>
  )
}

function parsePage(value: string | null): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1
}

function parseStatus(value: string | null): ResourceStatus | undefined {
  return value === 'draft' || value === 'completed' ? value : undefined
}

function parseSort(value: string | null): 'asc' | 'desc' {
  return value === 'asc' ? 'asc' : 'desc'
}

function updateParams(
  setSearchParams: ReturnType<typeof useSearchParams>[1],
  patch: Record<string, string | null>,
) {
  setSearchParams(
    (previous) => {
      const next = new URLSearchParams(previous)
      for (const [key, value] of Object.entries(patch)) {
        if (value === null) {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      }
      return next
    },
    { replace: true },
  )
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`

const Title = styled.h1`
  font-size: 2rem;
`

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.inkMuted};
  margin-top: ${({ theme }) => theme.spacing.xs};
`

const Filters = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 200px 200px;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

const Notice = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.inkMuted};
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    text-align: left;
    padding: ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    font-family: ${({ theme }) => theme.typography.heading};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.inkStrong};
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`

const Th = styled.th`
  width: 48px;
`

const NameLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`

const RowActions = styled.div`
  display: flex;
  justify-content: flex-end;
`

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.inkMuted};
  flex-wrap: wrap;
`

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const PageIndicator = styled.span`
  font-variant-numeric: tabular-nums;
`
