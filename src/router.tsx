import type { RouteObject } from 'react-router-dom'

import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'

const StubPage = ({ title }: { title: string }) => <h1>{title}</h1>

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/guide', element: <StubPage title="規則整理" /> },
      { path: '/dictionary', element: <StubPage title="動詞字典" /> },
      { path: '/lookup', element: <StubPage title="動詞查詢" /> },
      { path: '/verbs/:verbId', element: <StubPage title="動詞詳細資料" /> },
      { path: '/practice', element: <StubPage title="快速練習" /> },
    ],
  },
]
