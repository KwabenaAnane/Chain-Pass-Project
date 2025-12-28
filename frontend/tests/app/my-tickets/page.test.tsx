import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock lib/config BEFORE importing the component
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

// Mock fetch for metadata
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
) as any

import { useAccount, useReadContract } from 'wagmi'
import MyTicketsPage from '@/app/my-tickets/page'

describe('MyTicketsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows connect wallet message when not connected', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: undefined,
    } as any)

    vi.mocked(useReadContract).mockReturnValue({
      data: 0n,
      isLoading: false,
      isError: false,
    } as any)

    render(<MyTicketsPage />)
    
    expect(screen.getByText('Connect your wallet to view your tickets')).toBeInTheDocument()
  })

  it('renders page title when connected', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
    } as any)

    vi.mocked(useReadContract).mockReturnValue({
      data: 0n,
      isLoading: false,
      isError: false,
    } as any)

    render(<MyTicketsPage />)
    
    expect(screen.getByText('My Tickets')).toBeInTheDocument()
  })

  it('renders ticket cards for owned tickets', async () => {
    const userAddress = '0x1234567890123456789012345678901234567890'
    
    vi.mocked(useAccount).mockReturnValue({
      address: userAddress,
    } as any)

    const mockEvent = {
      name: 'Test Event',
      fee: 100000000000000000n,
      deadline: 1735689600n,
      maxParticipants: 100n,
      participantCount: 50n,
      isOpen: true,
      organizer: '0xABCD',
      fundsWithdrawn: false,
    }

    let callCount = 0
    vi.mocked(useReadContract).mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // eventCounter call
        return { data: 1n, isLoading: false, isError: false } as any
      } else if (callCount === 2) {
        // balance call
        return { data: 1n, isLoading: false, isError: false } as any
      } else if (callCount === 3) {
        // event details call
        return { data: mockEvent, isLoading: false, isError: false } as any
      } else {
        // tokenURI call
        return { data: 'ipfs://test', isLoading: false, isError: false } as any
      }
    })

    render(<MyTicketsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument()
    })
  })

  it('does not render tickets with zero balance', () => {
    const userAddress = '0x1234567890123456789012345678901234567890'
    
    vi.mocked(useAccount).mockReturnValue({
      address: userAddress,
    } as any)

    let callCount = 0
    vi.mocked(useReadContract).mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return { data: 1n, isLoading: false, isError: false } as any
      } else {
        return { data: 0n, isLoading: false, isError: false } as any
      }
    })

    render(<MyTicketsPage />)
    
    expect(screen.getByText('My Tickets')).toBeInTheDocument()
    expect(screen.queryByText('Test Event')).not.toBeInTheDocument()
  })

  it('displays token ID and payment info', async () => {
    const userAddress = '0x1234567890123456789012345678901234567890'
    
    vi.mocked(useAccount).mockReturnValue({
      address: userAddress,
    } as any)

    const mockEvent = {
      name: 'Paid Event',
      fee: 100000000000000000n,
      deadline: 1735689600n,
      maxParticipants: 100n,
      participantCount: 50n,
      isOpen: true,
      organizer: '0xABCD',
      fundsWithdrawn: false,
    }

    let callCount = 0
    vi.mocked(useReadContract).mockImplementation((config?: any) => {
      callCount++
      // Check what's being queried based on functionName or args
      if (config?.functionName === 'eventCounter' || callCount === 1) {
        return { data: 2n, isLoading: false, isError: false } as any
      } else if (config?.functionName === 'balanceOf') {
        // First event has no balance, second event has balance
        const eventId = config?.args?.[1]
        if (eventId === 1n) {
          return { data: 0n, isLoading: false, isError: false } as any
        } else {
          return { data: 1n, isLoading: false, isError: false } as any
        }
      } else if (config?.functionName === 'getEventDetails') {
        return { data: mockEvent, isLoading: false, isError: false } as any
      } else if (config?.functionName === 'uri') {
        return { data: 'ipfs://test', isLoading: false, isError: false } as any
      }
      // Default fallback
      return { data: undefined, isLoading: false, isError: false } as any
    })

    render(<MyTicketsPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Token ID: #2/)).toBeInTheDocument()
      expect(screen.getByText(/Paid: 0.1 ETH/)).toBeInTheDocument()
    })
  })

  it('renders NFT image when metadata is available', async () => {
    const userAddress = '0x1234567890123456789012345678901234567890'
    
    vi.mocked(useAccount).mockReturnValue({
      address: userAddress,
    } as any)

    const mockEvent = {
      name: 'Event with NFT',
      fee: 100000000000000000n,
      deadline: 1735689600n,
      maxParticipants: 100n,
      participantCount: 50n,
      isOpen: true,
      organizer: '0xABCD',
      fundsWithdrawn: false,
    }

    const mockMetadata = {
      image: 'ipfs://QmTest123',
      attributes: [
        { trait_type: 'Event', value: 'Test' }
      ]
    }

    let callCount = 0
    vi.mocked(useReadContract).mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return { data: 1n, isLoading: false, isError: false } as any
      } else if (callCount === 2) {
        return { data: 1n, isLoading: false, isError: false } as any
      } else if (callCount === 3) {
        return { data: mockEvent, isLoading: false, isError: false } as any
      } else {
        return { data: 'ipfs://metadata', isLoading: false, isError: false } as any
      }
    })

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: () => Promise.resolve(mockMetadata),
    } as any)

    const { findByAltText } = render(<MyTicketsPage />)
    
    const image = await findByAltText('Ticket NFT')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', expect.stringContaining('https://ipfs.io/ipfs/'))
  })

  it('shows placeholder emoji when no metadata image', () => {
    const userAddress = '0x1234567890123456789012345678901234567890'
    
    vi.mocked(useAccount).mockReturnValue({
      address: userAddress,
    } as any)

    const mockEvent = {
      name: 'Event',
      fee: 100000000000000000n,
      deadline: 1735689600n,
      maxParticipants: 100n,
      participantCount: 50n,
      isOpen: true,
      organizer: '0xABCD',
      fundsWithdrawn: false,
    }

    let callCount = 0
    vi.mocked(useReadContract).mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return { data: 1n, isLoading: false, isError: false } as any
      } else if (callCount === 2) {
        return { data: 1n, isLoading: false, isError: false } as any
      } else if (callCount === 3) {
        return { data: mockEvent, isLoading: false, isError: false } as any
      } else {
        return { data: undefined, isLoading: false, isError: false } as any
      }
    })

    render(<MyTicketsPage />)
    
    expect(screen.getByText('🎟️')).toBeInTheDocument()
  })

  it('renders links to event details and Rarible', async () => {
    const userAddress = '0x1234567890123456789012345678901234567890'
    
    vi.mocked(useAccount).mockReturnValue({
      address: userAddress,
    } as any)

    const mockEvent = {
      name: 'Event',
      fee: 100000000000000000n,
      deadline: 1735689600n,
      maxParticipants: 100n,
      participantCount: 50n,
      isOpen: true,
      organizer: '0xABCD',
      fundsWithdrawn: false,
    }

    let callCount = 0
    vi.mocked(useReadContract).mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return { data: 1n, isLoading: false, isError: false } as any
      } else if (callCount === 2) {
        return { data: 1n, isLoading: false, isError: false } as any
      } else if (callCount === 3) {
        return { data: mockEvent, isLoading: false, isError: false } as any
      } else {
        return { data: 'ipfs://test', isLoading: false, isError: false } as any
      }
    })

    render(<MyTicketsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('View Event Details →')).toBeInTheDocument()
      expect(screen.getByText('View NFT on Rarible →')).toBeInTheDocument()
    })
  })
})