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

  it('renders a confirmed verb with a complete form table', () => {
    render(
      <RouterProvider
        router={createMemoryRouter(routes, {
          initialEntries: ['/lookup?q=食べる'],
        })}
      />,
    )

    expect(screen.getByText('已核對資料')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '食べる' })).toBeInTheDocument()
    expect(screen.getAllByText('食べられる').length).toBeGreaterThan(0)
  })

  it('keeps a visible warning on inferred results', () => {
    render(
      <RouterProvider
        router={createMemoryRouter(routes, {
          initialEntries: ['/lookup?q=まぜる'],
        })}
      />,
    )

    expect(screen.getByText('規則推測')).toBeInTheDocument()
    expect(
      screen.getByText('推測結果，可能未涵蓋例外，請再查字典。'),
    ).toBeInTheDocument()
  })

  it('asks for kana before inferring an unrecorded kanji verb', async () => {
    const user = userEvent.setup()
    const router = createMemoryRouter(routes, {
      initialEntries: ['/lookup?q=混ぜる'],
    })
    render(<RouterProvider router={router} />)

    await user.type(screen.getByRole('textbox', { name: '補充完整假名' }), 'まぜる')
    await user.click(screen.getByRole('button', { name: '使用假名推測' }))

    expect(router.state.location.search).toContain('reading=')
    expect(await screen.findByText('混ぜます')).toBeInTheDocument()
  })
})
