import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('App', () => {
  it('introduces the Japanese verb learning site', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: '日文動詞全解析系統' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('規則、查詢與練習都從同一套已核對資料出發。'),
    ).toBeInTheDocument()
  })
})
