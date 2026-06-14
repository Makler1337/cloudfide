import { useContext } from 'react'

import { CompletedBufferContext, type BufferValue } from './context'

export function useCompletedBuffer(): BufferValue {
  const value = useContext(CompletedBufferContext)
  if (!value) {
    throw new Error('useCompletedBuffer must be used inside CompletedBufferProvider')
  }
  return value
}
