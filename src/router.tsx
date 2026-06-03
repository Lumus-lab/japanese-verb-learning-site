import type { RouteObject } from 'react-router-dom'

import { Layout } from './components/Layout'
import { DictionaryPage } from './pages/DictionaryPage'
import { GuidePage } from './pages/GuidePage'
import { HomePage } from './pages/HomePage'
import { LookupPage, VerbPage } from './pages/LookupPage'

const StubPage = ({ title }: { title: string }) => <h1>{title}</h1>

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/guide', element: <GuidePage /> },
      { path: '/dictionary', element: <DictionaryPage /> },
      { path: '/lookup', element: <LookupPage /> },
      { path: '/verbs/:verbId', element: <VerbPage /> },
      { path: '/practice', element: <StubPage title="快速練習" /> },
    ],
  },
]
