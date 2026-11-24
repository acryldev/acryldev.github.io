import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { HomePage } from './HomePage'

afterEach(cleanup)

describe('home hero gallery', () => {
  it('opens on Control Center and switches through ADE and WebBoxes.ai and back', () => {
    const { container } = render(createElement(MemoryRouter, null, createElement(HomePage)))
    const src = () => container.querySelector('.hero-film img')?.getAttribute('src')
    expect(src()).toBe('/img/home/control-center.png')
    fireEvent.click(screen.getByRole('tab', { name: 'ADE' }))
    expect(src()).toBe('/img/home/ade.png')
    expect(screen.getByRole('tab', { name: 'ADE' }).getAttribute('aria-selected')).toBe('true')
    fireEvent.click(screen.getByRole('tab', { name: 'WebBoxes.ai' }))
    expect(src()).toBe('/img/home/webboxes.webp')
    fireEvent.click(screen.getByRole('tab', { name: 'Control Center' }))
    expect(src()).toBe('/img/home/control-center.png')
  })
})
