import styled from 'styled-components'

interface MultiCheckListProps {
  label: string
  options: readonly string[]
  value: readonly string[]
  onChange: (next: string[]) => void
  error?: string
  helper?: string
  disabled?: boolean
}

// Replacement for the design-system CheckboxGroup so that the whole row
// (text and visible box) is clickable. The native input nested inside a
// <label> gives us that for free.
export function MultiCheckList({
  label,
  options,
  value,
  onChange,
  error,
  helper,
  disabled = false,
}: MultiCheckListProps) {
  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option))
    } else {
      onChange([...value, option])
    }
  }

  return (
    <Group>
      <GroupLabel>{label}</GroupLabel>
      <List>
        {options.map((option) => {
          const checked = value.includes(option)
          return (
            <Row key={option}>
              <Input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(option)}
              />
              <span>{option}</span>
            </Row>
          )
        })}
      </List>
      {error ? <Helper $hasError>{error}</Helper> : null}
      {!error && helper ? <Helper>{helper}</Helper> : null}
    </Group>
  )
}

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const GroupLabel = styled.span`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.inkStrong};
  font-weight: 500;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

const Row = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  user-select: none;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const Input = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};
`

const Helper = styled.span<{ $hasError?: boolean }>`
  font-size: 0.75rem;
  color: ${({ $hasError, theme }) =>
    $hasError ? theme.colors.warning : theme.colors.inkMuted};
`
