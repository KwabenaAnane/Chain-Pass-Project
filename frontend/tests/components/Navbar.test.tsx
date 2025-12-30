import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '@/components/Navbar';

/* -------------------- MOCKS -------------------- */

vi.mock('next/navigation', () => ({
  usePathname: () => '/events',
}));

vi.mock('wagmi', () => ({
  useAccount: () => ({
    isConnected: true,
  }),
}));

vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button>Connect Wallet</button>,
}));

/* -------------------- TESTS -------------------- */

describe('Navbar', () => {
  it('renders brand', () => {
    render(<Navbar />);
    expect(screen.getByText('ChainPass')).toBeInTheDocument();
  });

  it('renders wallet button', () => {
    render(<Navbar />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('opens mobile menu when hamburger is clicked', async () => {
    render(<Navbar />);

    const user = userEvent.setup();
    const toggle = screen.getByLabelText('Toggle menu');

    await user.click(toggle);

    // wait for menu to appear
    expect(await screen.findByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('closes mobile menu when hamburger is clicked again', async () => {
    render(<Navbar />);

    const user = userEvent.setup();
    const toggle = screen.getByLabelText('Toggle menu');

    await user.click(toggle);
    expect(await screen.findByText('Events')).toBeInTheDocument();

    await user.click(toggle);
    expect(screen.queryByText('Events')).not.toBeInTheDocument();
  });

  it('highlights active route', async () => {
    render(<Navbar />);

    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Toggle menu'));

    const active = await screen.findByText('Events');
    expect(active.className).toContain('text-primary');
  });
});
