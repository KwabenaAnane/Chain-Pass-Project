'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  return (
    <nav className="border-b border-white/10 backdrop-blur-lg bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            🎟️ ChainPass
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/events" className="hover:text-primary transition">
              Events
            </Link>
            <Link href="/create" className="hover:text-primary transition">
              Create
            </Link>
            <Link href="/my-tickets" className="hover:text-primary transition">
              My Tickets
            </Link>
            <Link href="/manage" className="hover:text-primary transition">
              Manage
            </Link>
            <Link href="/verify" className="hover:text-primary transition">
              Verify
            </Link>
          </div>

          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}