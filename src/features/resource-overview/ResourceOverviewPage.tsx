import { useParams } from 'react-router-dom'

export function ResourceOverviewPage() {
  const { resourceId } = useParams()
  return <h1>Overview {resourceId}</h1>
}
