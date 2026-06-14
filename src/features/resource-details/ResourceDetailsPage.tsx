import { useParams } from 'react-router-dom'

export function ResourceDetailsPage() {
  const { resourceId } = useParams()
  return <h1>Details {resourceId}</h1>
}
