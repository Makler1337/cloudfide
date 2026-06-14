import { Badge, type BadgeVariant } from '../../design-system'

const CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  low: { label: 'Low', variant: 'neutral' },
  medium: { label: 'Medium', variant: 'info' },
  high: { label: 'High', variant: 'warning' },
}

interface PriorityBadgeProps {
  priority: string
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = CONFIG[priority]
  if (!config) return <span>—</span>
  return <Badge variant={config.variant}>{config.label}</Badge>
}
