'use client';

import { Twitter, Instagram, Github, Send } from 'lucide-react';

export default function Footer() {
  const socialLinks = [
    { href: 'https://twitter.com/chainpass', icon: Twitter, name: 'Twitter' },
    {
      href: 'https://instagram.com/chainpass',
      icon: Instagram,
      name: 'Instagram',
    },
    { href: 'https://github.com/chainpass', icon: Github, name: 'GitHub' },
    { href: 'https://t.me/chainpass', icon: Send, name: 'Telegram' },
  ];

  return (
    <footer className='border-t border-white/10 backdrop-blur-xl bg-dark-900/80 mt-20'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='flex flex-col items-center gap-4'>
          <p className='text-gray-400 text-sm'>© 2025 ChainPass</p>

          <div className='flex gap-4'>
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.name}
                  href={social.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={social.name}
                  title={social.name}
                  className='text-gray-400 hover:text-purple-400 hover:drop-shadow-[0_0_6px_rgba(168,85,247,0.6)] transition-all hover:scale-110'>
                  <Icon className='w-6 h-6' />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
