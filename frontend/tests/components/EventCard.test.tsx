import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock lib/config
vi.mock('@/lib/config', () => ({
  CONTRACT_ADDRESS: '0x1234567890123456789012345678901234567890',
}))

// Mock lib/abi
vi.mock('@/lib/abi', () => ({
  CHAINPASS_ABI: [],
}))

// Mock lib/format
vi.mock('@/lib/format', () => ({
  formatETH: (wei: bigint) => (Number(wei) / 1e18).toString(),
  formatDate: (timestamp: number) => new Date(timestamp * 1000).toLocaleDateString(),
  isPast: (timestamp: number) => timestamp < Date.now() / 1000,
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock wagmi
vi.mock('wagmi', () => ({
  useReadContract: vi.fn(),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Calendar: () => <span>Calendar</span>,
  Users: () => <span>Users</span>,
  DollarSign: () => <span>DollarSign</span>,
}))

import { useReadContract } from 'wagmi'
import EventCard from '@/components/EventCard'

describe('EventCard', () => {
  const mockEvent = {
    name: 'Blockchain Conference 2025',
    fee: 100000000000000000n, // 0.1 ETH in wei
    maxParticipants: 100n,
    participantCount: 50n,
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400), // Tomorrow
    isOpen: true,
    organizer: '0x1234567890123456789012345678901234567890',
    fundsWithdrawn: false,
  }

  it('shows loading state when event data is not available', () => {
    vi.mocked(useReadContract).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any)

    const { container } = render(<EventCard eventId={1} />)
    
    // Check for loading skeleton by class
    const loadingSkeleton = container.querySelector('.animate-pulse')
    expect(loadingSkeleton).toBeInTheDocument()
    expect(loadingSkeleton).toHaveClass('h-64')
  })

  it('renders event details correctly', () => {
    vi.mocked(useReadContract).mockReturnValue({
      data: mockEvent,
      isLoading: false,
      isError: false,
    } as any)

    render(<EventCard eventId={1} />)
    
    expect(screen.getByText('Blockchain Conference 2025')).toBeInTheDocument()
    expect(screen.getByText(/0.1 ETH/)).toBeInTheDocument()
    expect(screen.getByText(/50\/100 participants/)).toBeInTheDocument()
  })

  it('displays "Open" status for open events', () => {
    // Create event with future deadline (not past)
    const openEvent = {
      ...mockEvent,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 86400), // Tomorrow
    }

    vi.mocked(useReadContract).mockReturnValue({
      data: openEvent,
      isLoading: false,
      isError: false,
    } as any)

    render(<EventCard eventId={1} />)
    
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('displays "Full" status when event is full', () => {
    const fullEvent = {
      ...mockEvent,
      participantCount: 100n,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 86400), // Future deadline
    }

    vi.mocked(useReadContract).mockReturnValue({
      data: fullEvent,
      isLoading: false,
      isError: false,
    } as any)

    render(<EventCard eventId={1} />)
    
    expect(screen.getByText('Full')).toBeInTheDocument()
  })

  it('displays "Ended" status for past events', () => {
    const endedEvent = {
      ...mockEvent,
      deadline: 1640995200n, // Past timestamp
    }

    vi.mocked(useReadContract).mockReturnValue({
      data: endedEvent,
      isLoading: false,
      isError: false,
    } as any)

    render(<EventCard eventId={1} />)
    
    expect(screen.getByText('Ended')).toBeInTheDocument()
  })

  it('hides ended events when showEnded is false', () => {
    const endedEvent = {
      ...mockEvent,
      deadline: 1640995200n, // Past timestamp
    }

    vi.mocked(useReadContract).mockReturnValue({
      data: endedEvent,
      isLoading: false,
      isError: false,
    } as any)

    const { container } = render(<EventCard eventId={1} showEnded={false} />)
    
    expect(container.firstChild).toBeNull()
  })

  it('has correct link to event details page', () => {
    vi.mocked(useReadContract).mockReturnValue({
      data: mockEvent,
      isLoading: false,
      isError: false,
    } as any)

    render(<EventCard eventId={1} />)
    
    const link = screen.getByText('Blockchain Conference 2025').closest('a')
    expect(link).toHaveAttribute('href', '/events/1')
  })
})