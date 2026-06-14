import styled from 'styled-components'
import { Button, Drawer } from '../../design-system'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description?: string
  confirmLabel: string
  isLoading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  isLoading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Drawer title={title} isOpen={isOpen} onClose={isLoading ? () => {} : onCancel}>
      <Body>
        {description ? <Description>{description}</Description> : null}
        <Actions>
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Working…' : confirmLabel}
          </Button>
        </Actions>
      </Body>
    </Drawer>
  )
}

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

const Description = styled.p`
  color: ${({ theme }) => theme.colors.inkMuted};
  line-height: 1.5;
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`
