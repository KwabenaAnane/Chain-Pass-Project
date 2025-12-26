import Link from 'next/link';
import { Ticket, Shield, RefreshCcw } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-block">
            <span className="text-7xl md:text-8xl">🎟️</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Decentralized Event
            <span className="block mt-2 bg-gradient-purple bg-clip-text text-transparent">
              Registration
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Register for events on-chain and receive NFT tickets. 
            Transparent, secure, and verifiable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/events" className="btn-primary text-center">
              Browse Events
            </Link>
            <Link href="/create" className="btn-secondary text-center">
              Create Event
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          <div className="card group hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-purple p-4 rounded-xl w-fit mb-4 group-hover:shadow-lg group-hover:shadow-primary/50 transition-shadow">
              <Ticket size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">NFT Tickets</h3>
            <p className="text-gray-400 leading-relaxed">
              Get a unique NFT for each event you register for. View it in your wallet anytime.
            </p>
          </div>

          <div className="card group hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-purple p-4 rounded-xl w-fit mb-4 group-hover:shadow-lg group-hover:shadow-secondary/50 transition-shadow">
              <Shield size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">On-Chain</h3>
            <p className="text-gray-400 leading-relaxed">
              All registrations verified on Ethereum blockchain. Transparent and immutable.
            </p>
          </div>

          <div className="card group hover:scale-105 transition-transform duration-300 sm:col-span-2 lg:col-span-1">
            <div className="bg-gradient-purple p-4 rounded-xl w-fit mb-4 group-hover:shadow-lg group-hover:shadow-primary/50 transition-shadow">
              <RefreshCcw size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Refundable</h3>
            <p className="text-gray-400 leading-relaxed">
              Cancel anytime before deadline and get your full registration fee back.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}