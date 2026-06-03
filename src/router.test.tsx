import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { routes } from './router'

describe('router', () => {
  it('shows the four public learning sections', () => {
    render(
      <RouterProvider
        router={createMemoryRouter(routes, { initialEntries: ['/'] })}
      />,
    )
    const nav = within(screen.getByRole('navigation', { name: '主要導覽' }))

    expect(nav.getByRole('link', { name: '首頁' })).toBeInTheDocument()
    expect(nav.getByRole('link', { name: '規則整理' })).toBeInTheDocument()
    expect(nav.getByRole('link', { name: '動詞字典' })).toBeInTheDocument()
    expect(nav.getByRole('link', { name: '快速練習' })).toBeInTheDocument()
  })

  it('navigates a home lookup to the lookup page', async () => {
    const user = userEvent.setup()
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })
    render(<RouterProvider router={router} />)

    await user.type(screen.getByRole('searchbox', { name: '搜尋動詞' }), '食べる')
    await user.click(screen.getByRole('button', { name: '查詢' }))

    expect(router.state.location.pathname).toBe('/lookup')
    expect(router.state.location.search).toBe(
      '?q=%E9%A3%9F%E3%81%B9%E3%82%8B',
    )
  })
})
