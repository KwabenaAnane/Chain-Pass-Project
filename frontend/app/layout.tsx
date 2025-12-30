import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChainPass - Decentralized Event Registration',
  description: 'Register for events on-chain and get NFT tickets',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dark-900 text-white`}>
        <Providers>
          {/* Top Navbar */}
          <Navbar />

          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="min-h-screen pt-20 md:ml-64 px-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="md:ml-64">
            <Footer />
          </footer>
        </Providers>
      </body>
    </html>
  );
}
