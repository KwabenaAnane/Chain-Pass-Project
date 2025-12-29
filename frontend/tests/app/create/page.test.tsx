import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/lib/config', () => ({ CONTRACT_ADDRESS: '0x1234567890123456789012345678901234567890' }))
vi.mock('@/lib/abi', () => ({ CHAINPASS_ABI: [] }))
vi.mock('@/lib/format', () => ({ toWei: (eth: string) => BigInt(Math.floor(parseFloat(eth) * 1e18)) }))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }))

const mockWriteContract = vi.fn()
vi.mock('wagmi', () => ({
  useWriteContract: vi.fn(),
  useWaitForTransactionReceipt: vi.fn(),
}))

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import CreateEventPage from '@/app/create/page'

describe('CreateEventPage', () => {
  beforeEach(() => {
    mockWriteContract.mockClear()
    mockPush.mockClear()
    
    vi.mocked(useWriteContract).mockReturnValue({
      writeContract: mockWriteContract,
      data: undefined,
    } as any)

    vi.mocked(useWaitForTransactionReceipt).mockReturnValue({
      isLoading: false,
      isSuccess: false,
    } as any)
  })

  it('renders form with all fields', () => {
    render(<CreateEventPage />)
    
    expect(screen.getByRole('heading', { name: 'Create Event' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Blockchain Conference 2025')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('0.1')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('100')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Event/i })).toBeInTheDocument()
  })

  it('updates input values when user types', async () => {
    const user = userEvent.setup()
    render(<CreateEventPage />)
    
    const nameInput = screen.getByPlaceholderText('Blockchain Conference 2025')
    const feeInput = screen.getByPlaceholderText('0.1')
    
    await user.type(nameInput, 'Test Event')
    await user.type(feeInput, '0.05')
    
    expect(nameInput).toHaveValue('Test Event')
    expect(feeInput).toHaveValue(0.05)
  })

  it('calls writeContract on form submit', async () => {
    const user = userEvent.setup()
    render(<CreateEventPage />)
    
    await user.type(screen.getByPlaceholderText('Blockchain Conference 2025'), 'Test Event')
    await user.type(screen.getByPlaceholderText('0.1'), '0.05')
    await user.type(screen.getByPlaceholderText('100'), '50')
    
    // Find deadline input by type attribute
    const deadlineInput = screen.getByDisplayValue('')
    await user.type(deadlineInput, '2025-12-31T23:59')
    
    await user.click(screen.getByRole('button', { name: /Create Event/i }))
    
    expect(mockWriteContract).toHaveBeenCalledTimes(1)
    expect(mockWriteContract).toHaveBeenCalledWith(expect.objectContaining({
      functionName: 'createEvent',
    }))
  })

  it('shows loading state during transaction', () => {
    vi.mocked(useWaitForTransactionReceipt).mockReturnValue({
      isLoading: true,
      isSuccess: false,
    } as any)

    render(<CreateEventPage />)
    
    const submitButton = screen.getByRole('button', { name: /Creating.../i })
    expect(submitButton).toBeDisabled()
  })

  it('shows success message after transaction', () => {
    vi.mocked(useWaitForTransactionReceipt).mockReturnValue({
      isLoading: false,
      isSuccess: true,
    } as any)

    render(<CreateEventPage />)
    
    expect(screen.getByText(/Event created! Redirecting.../)).toBeInTheDocument()
  })

  it('redirects to events page on success', async () => {
    vi.useFakeTimers()
    
    vi.mocked(useWaitForTransactionReceipt).mockReturnValue({
      isLoading: false,
      isSuccess: true,
    } as any)

    render(<CreateEventPage />)
    
    await vi.advanceTimersByTimeAsync(2100)
    
    expect(mockPush).toHaveBeenCalledWith('/events')
    
    vi.useRealTimers()
  }, 10000) 
})