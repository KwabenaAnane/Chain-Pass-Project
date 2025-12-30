'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/events', label: 'Events' },
  { href: '/create', label: 'Create' },
  { href: '/my-tickets', label: 'My Tickets' },
  { href: '/manage', label: 'Manage' },
  { href: '/verify', label: 'Verify' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isConnected } = useAccount();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-dark-900/80">
      <div className="px-6 h-20 flex items-center justify-between">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-4">
          {/* Hamburger (mobile & tablet) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white rounded-lg hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl">🎟️</span>
            <span className="text-2xl font-bold bg-gradient-purple bg-clip-text text-transparent">
              ChainPass
            </span>
          </Link>
        </div>

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

      {/* Mobile / Tablet Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-dark-900/95 backdrop-blur-xl">
          <div className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    px-4 py-3 rounded-xl font-medium transition
                    ${isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
