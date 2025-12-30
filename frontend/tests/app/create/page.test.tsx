import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateEventPage from '@/app/create/page';

/* ------------------------------------------------------------------ */
/* MOCKS */
/* ------------------------------------------------------------------ */

vi.mock('@/lib/config', () => ({
  CONTRACT_ADDRESS: '0x1234567890123456789012345678901234567890',
}));

vi.mock('@/lib/abi', () => ({
  CHAINPASS_ABI: [],
}));

vi.mock('@/lib/format', () => ({
  toWei: (eth: string) =>
    BigInt(Math.floor(parseFloat(eth) * 1e18)),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockWriteContractAsync = vi.fn();

vi.mock('wagmi', () => ({
  useWriteContract: () => ({
    writeContractAsync: mockWriteContractAsync,
  }),
  useWaitForTransactionReceipt: vi.fn(),
}));

import { useWaitForTransactionReceipt } from 'wagmi';

/* ------------------------------------------------------------------ */
/* TESTS */
/* ------------------------------------------------------------------ */

describe('CreateEventPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // default: not loading, not success
    vi.mocked(useWaitForTransactionReceipt).mockReturnValue({
      isLoading: false,
      isSuccess: false,
    } as any);
  });

  it('renders form fields', () => {
    render(<CreateEventPage />);

    expect(
      screen.getByRole('heading', { name: /Create Event/i })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('Blockchain Conference 2025')
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText('0.1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('100')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Create Event/i })
    ).toBeInTheDocument();
  });

  it('updates inputs when typing', async () => {
    const user = userEvent.setup();
    render(<CreateEventPage />);

    const nameInput = screen.getByPlaceholderText(
      'Blockchain Conference 2025'
    ) as HTMLInputElement;

    const feeInput = screen.getByPlaceholderText(
      '0.1'
    ) as HTMLInputElement;

    await user.type(nameInput, 'Test Event');
    await user.type(feeInput, '0.05');

    expect(nameInput.value).toBe('Test Event');
    expect(feeInput.value).toBe('0.05');
  });

  it('shows loading overlay when confirming transaction', () => {
    vi.mocked(useWaitForTransactionReceipt).mockReturnValue({
      isLoading: true,
      isSuccess: false,
    } as any);

    render(<CreateEventPage />);

    expect(
      screen.getByText(/Creating event on-chain/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Creating/i })
    ).toBeDisabled();
  });

  it('shows success message when transaction succeeds', () => {
    vi.mocked(useWaitForTransactionReceipt).mockReturnValue({
      isLoading: false,
      isSuccess: true,
    } as any);

    render(<CreateEventPage />);

    expect(
      screen.getByText(/Event created! Redirecting/i)
    ).toBeInTheDocument();
  });

  it('redirects to /events after success', async () => {
    vi.useFakeTimers();

    vi.mocked(useWaitForTransactionReceipt).mockReturnValue({
      isLoading: false,
      isSuccess: true,
    } as any);

    render(<CreateEventPage />);

    await vi.advanceTimersByTimeAsync(2100);

    expect(mockPush).toHaveBeenCalledWith('/events');

    vi.useRealTimers();
  });
});
