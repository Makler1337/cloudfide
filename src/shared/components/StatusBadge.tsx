import { Badge } from '../../design-system'
import type { ResourceStatus } from '../../domain/types'

interface StatusBadgeProps {
  status: ResourceStatus
}

const LABELS: Record<ResourceStatus, string> = {
  draft: 'Draft',
  completed: 'Completed',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={status === 'completed' ? 'success' : 'info'}>{LABELS[status]}</Badge>
  )
}
