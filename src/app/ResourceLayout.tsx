import { Outlet, useParams } from 'react-router-dom'
import { CompletedBufferProvider } from '../features/completed-buffer/CompletedBufferContext'

export function ResourceLayout() {
  const { resourceId } = useParams<{ resourceId: string }>()

  // Keying by resourceId remounts the provider when the resource changes,
  // dropping the buffer for the previous resource.
  return (
    <CompletedBufferProvider key={resourceId}>
      <Outlet />
    </CompletedBufferProvider>
  )
}
