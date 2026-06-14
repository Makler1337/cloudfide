import { useParams } from 'react-router-dom'

export function BasicInfoPage() {
  const { resourceId } = useParams()
  return <h1>Basic Info {resourceId}</h1>
}
