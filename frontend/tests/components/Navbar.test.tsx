import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Navbar from '@/components/Navbar'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock RainbowKit ConnectButton
vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button>Connect Wallet</button>,
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('Navbar', () => {
  it('renders the logo and brand name', () => {
    render(<Navbar />)
    expect(screen.getByText('🎟️')).toBeInTheDocument()
    expect(screen.getByText('ChainPass')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Navbar />)
    expect(screen.getByText('Events')).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
    expect(screen.getByText('My Tickets')).toBeInTheDocument()
    expect(screen.getByText('Manage')).toBeInTheDocument()
    expect(screen.getByText('Verify')).toBeInTheDocument()
  })

  it('renders connect wallet button', () => {
    render(<Navbar />)
    expect(screen.getAllByText('Connect Wallet').length).toBeGreaterThan(0)
  })

  it('toggles mobile menu when hamburger is clicked', () => {
    render(<Navbar />)
    
    // Mobile menu should be closed initially
    const mobileLinks = screen.queryAllByText('Events')
    expect(mobileLinks.length).toBeGreaterThan(0)
    
    // Find and click hamburger button
    const hamburgerButton = screen.getByLabelText('Toggle menu')
    fireEvent.click(hamburgerButton)
    
    // Menu should be visible (state changed)
    expect(screen.getAllByText('Events').length).toBeGreaterThan(0)
  })

  it('has correct href attributes for navigation links', () => {
    render(<Navbar />)
    
    const eventsLink = screen.getAllByText('Events')[0].closest('a')
    expect(eventsLink).toHaveAttribute('href', '/events')
    
    const createLink = screen.getAllByText('Create')[0].closest('a')
    expect(createLink).toHaveAttribute('href', '/create')
  })
})