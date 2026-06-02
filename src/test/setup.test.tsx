import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('test setup', () => {
  it('renders a marker for the cleanup check', () => {
    render(<div>cleanup marker</div>)

    expect(screen.getByText('cleanup marker')).toBeInTheDocument()
  })

  it('cleans the DOM between tests', () => {
    expect(screen.queryByText('cleanup marker')).not.toBeInTheDocument()
  })
})
