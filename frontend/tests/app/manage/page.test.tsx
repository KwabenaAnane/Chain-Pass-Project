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
}))

// Mock wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useReadContract: vi.fn(),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Briefcase: () => <span>Briefcase</span>,
  Users: () => <span>Users</span>,
  DollarSign: () => <span>DollarSign</span>,
  Calendar: () => <span>Calendar</span>,
  CheckCircle: () => <span>CheckCircle</span>,
  Lock: () => <span>Lock</span>,
  Unlock: () => <span>Unlock</span>,
}))

import { useAccount, useReadContract } from 'wagmi'
import ManagePage from '@/app/manage/page'

describe('ManagePage', () => {

  it('renders page title and description when connected', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
    } as any)

    vi.mocked(useReadContract).mockReturnValue({
      data: 0n,
    } as any)

    render(<ManagePage />)
    
    expect(screen.getByText('Manage Events')).toBeInTheDocument()
    expect(screen.getByText('Control your created events and withdraw funds')).toBeInTheDocument()
  })

  it('renders event cards for organizer events', () => {
    const userAddress = '0x1234567890123456789012345678901234567890'
    
    vi.mocked(useAccount).mockReturnValue({
      address: userAddress,
    } as any)

    const mockEvent = {
      name: 'My Event',
      organizer: userAddress,
      fee: 100000000000000000n,
      maxParticipants: 100n,
      participantCount: 50n,
      deadline: 1735689600n,
      isOpen: true,
      fundsWithdrawn: false,
    }

    vi.mocked(useReadContract)
      .mockReturnValueOnce({ data: 1n } as any) // eventCounter
      .mockReturnValueOnce({ data: mockEvent } as any) // event details

    render(<ManagePage />)
    
    expect(screen.getByText('My Event')).toBeInTheDocument()
  })

  it('does not render events not organized by user', () => {
    const userAddress = '0x1234567890123456789012345678901234567890'
    const differentAddress = '0xABCDEF1234567890123456789012345678901234'
    
    vi.mocked(useAccount).mockReturnValue({
      address: userAddress,
    } as any)

    const mockEvent = {
      name: 'Someone Elses Event',
      organizer: differentAddress,
      fee: 100000000000000000n,
      maxParticipants: 100n,
      participantCount: 50n,
      deadline: 1735689600n,
      isOpen: true,
      fundsWithdrawn: false,
    }

    vi.mocked(useReadContract)
      .mockReturnValueOnce({ data: 1n } as any)
      .mockReturnValueOnce({ data: mockEvent } as any)

    render(<ManagePage />)
    
    expect(screen.queryByText('Someone Elses Event')).not.toBeInTheDocument()
  })

  it('displays correct event status badges', () => {
    const userAddress = '0x1234567890123456789012345678901234567890'
    
    vi.mocked(useAccount).mockReturnValue({
      address: userAddress,
    } as any)

    const openEvent = {
      name: 'Open Event',
      organizer: userAddress,
      fee: 100000000000000000n,
      maxParticipants: 100n,
      participantCount: 50n,
      deadline: 1735689600n,
      isOpen: true,
      fundsWithdrawn: false,
    }

    vi.mocked(useReadContract)
      .mockReturnValueOnce({ data: 1n } as any)
      .mockReturnValueOnce({ data: openEvent } as any)

    render(<ManagePage />)
    
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('shows funds withdrawn indicator when applicable', () => {
    const userAddress = '0x1234567890123456789012345678901234567890'
    
    vi.mocked(useAccount).mockReturnValue({
      address: userAddress,
    } as any)

    const eventWithdrawn = {
      name: 'Completed Event',
      organizer: userAddress,
      fee: 100000000000000000n,
      maxParticipants: 100n,
      participantCount: 100n,
      deadline: 1640995200n, // past
      isOpen: false,
      fundsWithdrawn: true,
    }

    vi.mocked(useReadContract)
      .mockReturnValueOnce({ data: 1n } as any)
      .mockReturnValueOnce({ data: eventWithdrawn } as any)

    render(<ManagePage />)
    
    expect(screen.getByText('Funds withdrawn')).toBeInTheDocument()
  })

  it('displays participant count and progress', () => {
    const userAddress = '0x1234567890123456789012345678901234567890'
    
    vi.mocked(useAccount).mockReturnValue({
      address: userAddress,
    } as any)

    const mockEvent = {
      name: 'Test Event',
      organizer: userAddress,
      fee: 100000000000000000n,
      maxParticipants: 100n,
      participantCount: 75n,
      deadline: 1735689600n,
      isOpen: true,
      fundsWithdrawn: false,
    }

    vi.mocked(useReadContract)
      .mockReturnValueOnce({ data: 1n } as any)
      .mockReturnValueOnce({ data: mockEvent } as any)

    render(<ManagePage />)
    
    expect(screen.getByText('75/100')).toBeInTheDocument()
  })

  it('has correct link to event details page', () => {
    const userAddress = '0x1234567890123456789012345678901234567890'
    
    vi.mocked(useAccount).mockReturnValue({
      address: userAddress,
    } as any)

    const mockEvent = {
      name: 'Linked Event',
      organizer: userAddress,
      fee: 100000000000000000n,
      maxParticipants: 100n,
      participantCount: 50n,
      deadline: 1735689600n,
      isOpen: true,
      fundsWithdrawn: false,
    }

    vi.mocked(useReadContract)
      .mockReturnValueOnce({ data: 1n } as any)
      .mockReturnValueOnce({ data: mockEvent } as any)

    render(<ManagePage />)
    
    const link = screen.getByText('Linked Event').closest('a')
    expect(link).toHaveAttribute('href', '/events/1')
  })
})