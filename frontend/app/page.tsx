import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-6">
          Decentralized Event
          <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Registration
          </span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Register for events on-chain and receive NFT tickets. 
          Transparent, secure, and verifiable.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/events" className="btn-primary">
            Browse Events
          </Link>
          <Link href="/create" className="btn-secondary">
            Create Event
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="card">
            <div className="text-4xl mb-4">🎫</div>
            <h3 className="text-xl font-bold mb-2">NFT Tickets</h3>
            <p className="text-gray-400">Get a unique NFT for each event you register for</p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">⛓️</div>
            <h3 className="text-xl font-bold mb-2">On-Chain</h3>
            <p className="text-gray-400">All registrations verified on Ethereum blockchain</p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Refundable</h3>
            <p className="text-gray-400">Cancel anytime before deadline and get refund</p>
          </div>
        </div>
      </div>
    </div>
  );
}