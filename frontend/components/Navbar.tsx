'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function Navbar() {
  const { isConnected } = useAccount();

  return (
    <nav className="sticky top-0 z-50 h-20 border-b border-white/10 backdrop-blur-xl bg-dark-900/80">
      <div className="max-w-full px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="text-3xl">🎟️</span>
          <span className="text-2xl font-bold bg-gradient-purple bg-clip-text text-transparent">
            ChainPass
          </span>
        </Link>

        {/* Wallet */}
        <div
          className={`
            rounded-xl p-[2px] transition
            ${isConnected ? 'bg-gradient-purple' : 'bg-white/10'}
          `}
        >
          <div className="bg-dark-900 rounded-xl">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
