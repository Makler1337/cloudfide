import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { Button, Drawer, Input } from '../../design-system'
import { createResourceFormSchema } from '../../domain/schemas'
import type { CreateResourceFormValues } from '../../domain/types'
import { useCreateResource } from '../../hooks/resources'
import { ApiError } from '../../api/errors'

interface CreateResourceDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateResourceDrawer({ isOpen, onClose }: CreateResourceDrawerProps) {
  const navigate = useNavigate()
  const createMutation = useCreateResource()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<CreateResourceFormValues>({
    resolver: zodResolver(createResourceFormSchema),
    defaultValues: { resourceName: '' },
  })

  useEffect(() => {
    if (!isOpen) reset({ resourceName: '' })
  }, [isOpen, reset])

  const onSubmit = handleSubmit(async ({ resourceName }) => {
    try {
      const resource = await createMutation.mutateAsync(resourceName)
      onClose()
      navigate(`/resources/${resource.resourceId}`)
    } catch (error) {
      if (error instanceof ApiError) {
        setError('resourceName', { type: 'server', message: error.message })
      } else {
        setError('resourceName', { type: 'server', message: 'Something went wrong' })
      }
    }
  })

  const isBusy = isSubmitting || createMutation.isPending

  return (
    <Drawer title="New resource" isOpen={isOpen} onClose={isBusy ? () => {} : onClose}>
      <Form onSubmit={onSubmit} noValidate>
        <Input
          label="Resource name"
          placeholder="e.g. Marketing site launch"
          autoFocus
          error={errors.resourceName?.message}
          helperText="Letters, numbers, spaces, and hyphens. Cannot be changed later."
          {...register('resourceName')}
        />
        <Actions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isBusy}>
            Cancel
          </Button>
          <Button type="submit" disabled={isBusy}>
            {isBusy ? 'Creating…' : 'Create resource'}
          </Button>
        </Actions>
      </Form>
    </Drawer>
  )
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`
