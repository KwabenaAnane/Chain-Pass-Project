'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  PlusCircle,
  Ticket,
  Settings,
  ShieldCheck,
} from 'lucide-react';

const navLinks = [
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/create', label: 'Create', icon: PlusCircle },
  { href: '/my-tickets', label: 'My Tickets', icon: Ticket },
  { href: '/manage', label: 'Manage', icon: Settings },
  { href: '/verify', label: 'Verify', icon: ShieldCheck },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 border-r border-white/10 bg-dark-900/80 backdrop-blur-xl">
      <nav className="flex flex-col gap-2 p-4 w-full">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'}
              `}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
