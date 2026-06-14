import { createBrowserRouter, Navigate } from 'react-router-dom'

import { RootLayout } from './RootLayout'
import { ResourceLayout } from './ResourceLayout'
import { ResourcesListPage } from '../features/resources-list/ResourcesListPage'
import { ResourceOverviewPage } from '../features/resource-overview/ResourceOverviewPage'
import { ResourceDetailsPage } from '../features/resource-details/ResourceDetailsPage'
import { BasicInfoPage } from '../features/module-basic-info/BasicInfoPage'
import { ProjectDetailsPage } from '../features/module-project-details/ProjectDetailsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/resources" replace /> },
      { path: 'resources', element: <ResourcesListPage /> },
      {
        path: 'resources/:resourceId',
        element: <ResourceLayout />,
        children: [
          { index: true, element: <ResourceOverviewPage /> },
          { path: 'basic-info', element: <BasicInfoPage /> },
          { path: 'project-details', element: <ProjectDetailsPage /> },
          { path: 'details', element: <ResourceDetailsPage /> },
        ],
      },
    ],
  },
])
