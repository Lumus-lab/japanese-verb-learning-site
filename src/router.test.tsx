import { render, screen } from '@testing-library/react'
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

    expect(screen.getByRole('link', { name: '首頁' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '規則整理' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '動詞字典' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '快速練習' })).toBeInTheDocument()
  })
})
