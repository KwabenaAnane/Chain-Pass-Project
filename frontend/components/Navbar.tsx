'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/events', label: 'Events' },
    { href: '/create', label: 'Create' },
    { href: '/my-tickets', label: 'My Tickets' },
    { href: '/manage', label: 'Manage' },
    { href: '/verify', label: 'Verify' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-dark-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🎟️</span>
            <span className="text-2xl font-bold bg-gradient-purple bg-clip-text text-transparent">
              ChainPass
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-primary transition-colors duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <ConnectButton />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-gray-300 hover:text-primary hover:bg-white/5 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}