import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import styled from 'styled-components'

import { Button, Input, Select } from '../../design-system'
import { PRIORITY_VALUES, basicInfoFormSchema } from '../../domain/schemas'
import type { BasicInfoFormValues } from '../../domain/types'

const PRIORITY_OPTIONS = [
  { value: '', label: 'Select priority…' },
  ...PRIORITY_VALUES.map((value) => ({ value, label: capitalize(value) })),
]

interface BasicInfoFormProps {
  initialValues: BasicInfoFormValues
  onSubmit: (values: BasicInfoFormValues) => Promise<void> | void
  onCancel: () => void
  submitLabel: string
  submitError?: string | null
}

export function BasicInfoForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  submitError,
}: BasicInfoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoFormSchema),
    defaultValues: initialValues,
  })

  // Re-sync when initial values change (e.g. resource refetch with newer data).
  useEffect(() => {
    reset(initialValues)
  }, [initialValues, reset])

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="Resource name"
        state="locked"
        helperText="Locked after creation."
        {...register('resourceName')}
      />
      <Input
        label="Owner"
        placeholder="Full name"
        error={errors.owner?.message}
        {...register('owner')}
      />
      <Input
        label="Email"
        type="email"
        placeholder="name@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Description"
        multiline
        rows={4}
        placeholder="What is this resource for?"
        error={errors.description?.message}
        {...register('description')}
      />
      <Select
        label="Priority"
        options={PRIORITY_OPTIONS}
        error={errors.priority?.message}
        {...register('priority')}
      />

      {submitError ? <ErrorBanner role="alert">{submitError}</ErrorBanner> : null}

      <Actions>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </Actions>
    </Form>
  )
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`

const ErrorBanner = styled.div`
  background: rgba(180, 71, 27, 0.08);
  color: ${({ theme }) => theme.colors.warning};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.875rem;
`
