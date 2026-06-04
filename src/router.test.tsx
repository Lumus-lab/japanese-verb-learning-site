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

  it('shows the beginner rule sections', () => {
    render(
      <RouterProvider
        router={createMemoryRouter(routes, { initialEntries: ['/guide'] })}
      />,
    )

    expect(
      screen.getByRole('heading', { name: '先分類，再變化' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'て形與た形的音便' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '判斷動詞分類的步驟' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '五段動詞變化表' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '一段動詞變化表' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '不規則動詞變化表' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '常見 る 結尾五段例外' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText(/帰る（かえる）/).length).toBeGreaterThan(0)
  })

  it('filters the dictionary by group', async () => {
    const user = userEvent.setup()
    render(
      <RouterProvider
        router={createMemoryRouter(routes, { initialEntries: ['/dictionary'] })}
      />,
    )

    await user.selectOptions(screen.getByLabelText('動詞分類'), 'irregular')

    expect(screen.getByText('勉強する')).toBeInTheDocument()
    expect(screen.queryByText('食べる')).not.toBeInTheDocument()
  })

  it('filters the dictionary to known exceptions', async () => {
    const user = userEvent.setup()
    render(
      <RouterProvider
        router={createMemoryRouter(routes, { initialEntries: ['/dictionary'] })}
      />,
    )

    await user.click(screen.getByRole('checkbox', { name: '只顯示常見例外' }))

    expect(screen.getByText('行く')).toBeInTheDocument()
    expect(screen.queryByText('食べる')).not.toBeInTheDocument()
  })

  it('navigates between confirmed verb detail pages', async () => {
    const user = userEvent.setup()
    const router = createMemoryRouter(routes, {
      initialEntries: ['/verbs/kaeru'],
    })
    render(<RouterProvider router={router} />)

    expect(screen.getByRole('heading', { name: '帰る' })).toBeInTheDocument()
    expect(screen.getByText('6 / 100')).toBeInTheDocument()

    const nextLink = screen.getByRole('link', { name: '下一個 食べる' })
    expect(nextLink).toHaveTextContent('→')

    await user.click(nextLink)

    expect(router.state.location.pathname).toBe('/verbs/taberu')
    expect(screen.getByRole('heading', { name: '食べる' })).toBeInTheDocument()
    expect(screen.getByText('7 / 100')).toBeInTheDocument()

    const previousLink = screen.getByRole('link', { name: '上一個 帰る' })
    expect(previousLink).toHaveTextContent('←')

    await user.click(previousLink)

    expect(router.state.location.pathname).toBe('/verbs/kaeru')
  })

  it('shows immediate feedback after answering a practice question', async () => {
    const user = userEvent.setup()
    render(
      <RouterProvider
        router={createMemoryRouter(routes, { initialEntries: ['/practice'] })}
      />,
    )

    expect(
      screen.getByRole('heading', { name: '快速練習' }),
    ).toBeInTheDocument()
    const answerButtons = screen
      .getAllByRole('button')
      .filter((button) => button.closest('.option-grid'))
    await user.click(answerButtons[0])

    expect(screen.getByText(/正確答案/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下一題' })).toBeInTheDocument()
  })

  it('lets learners choose a practice mode', async () => {
    const user = userEvent.setup()
    render(
      <RouterProvider
        router={createMemoryRouter(routes, { initialEntries: ['/practice'] })}
      />,
    )

    expect(screen.getByRole('group', { name: '練習模式' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '變化形' }))

    expect(screen.getByRole('button', { name: '變化形' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await user.click(screen.getByRole('button', { name: '動詞分類' }))

    expect(screen.getByRole('button', { name: '動詞分類' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
