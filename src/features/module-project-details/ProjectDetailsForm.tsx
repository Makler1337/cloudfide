import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import styled from 'styled-components'

import { Button, Input, Select } from '../../design-system'
import { MultiCheckList } from '../../shared/components/MultiCheckList'
import {
  CATEGORY_VALUES,
  TEAM_MEMBER_VALUES,
  projectDetailsFormSchema,
} from '../../domain/schemas'
import type { ProjectDetailsFormValues } from '../../domain/types'

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select category…' },
  ...CATEGORY_VALUES.map((value) => ({ value, label: capitalize(value) })),
]

interface ProjectDetailsFormProps {
  initialValues: ProjectDetailsFormValues
  onSubmit: (values: ProjectDetailsFormValues) => Promise<void> | void
  onCancel: () => void
  submitLabel: string
  submitError?: string | null
}

export function ProjectDetailsForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  submitError,
}: ProjectDetailsFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProjectDetailsFormValues>({
    resolver: zodResolver(projectDetailsFormSchema),
    defaultValues: initialValues,
  })

  useEffect(() => {
    reset(initialValues)
  }, [initialValues, reset])

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="Project name"
        placeholder="e.g. Q3 launch"
        error={errors.projectName?.message}
        {...register('projectName')}
      />
      <Input
        label="Budget"
        inputMode="numeric"
        placeholder="50000"
        helperText="Whole number, no separators."
        error={errors.budget?.message}
        {...register('budget')}
      />
      <Select
        label="Category"
        options={CATEGORY_OPTIONS}
        error={errors.category?.message}
        {...register('category')}
      />
      <Controller
        control={control}
        name="options"
        render={({ field }) => (
          <MultiCheckList
            label="Team members"
            options={TEAM_MEMBER_VALUES}
            value={field.value}
            onChange={field.onChange}
            error={errors.options?.message}
          />
        )}
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
