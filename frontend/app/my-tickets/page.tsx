'use client';

import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { CHAINPASS_ABI } from '@/lib/abi';
import Link from 'next/link';
import { formatETH, formatDate } from '@/lib/format';
import { useState, useEffect } from 'react';

export default function MyTicketsPage() {
  const { address } = useAccount();

  const { data: eventCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'eventCounter',
  });

  if (!address) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card text-center py-12">
          <p className="text-gray-400">Connect your wallet to view your tickets</p>
        </div>
      </div>
    );
  }

  const total = eventCount ? Number(eventCount) : 0;
  const eventIds = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">My Tickets</h1>
      
      <div className="space-y-4">
        {eventIds.map((id) => (
          <TicketCard key={id} eventId={id} userAddress={address} />
        ))}
      </div>
    </div>
  );
}

function TicketCard({ eventId, userAddress }: { eventId: number; userAddress: string }) {
  const [metadata, setMetadata] = useState<any>(null);

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`, BigInt(eventId)],
  });

  const { data: event } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'getEventDetails',
    args: [BigInt(eventId)],
    query: { enabled: balance ? balance > 0n : false },
  });

  const { data: tokenURI } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'uri',
    args: [BigInt(eventId)],
    query: { enabled: balance ? balance > 0n : false },
  });

  useEffect(() => {
    if (tokenURI) {
      // Convert IPFS URI to HTTP gateway
      const httpUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      
      fetch(httpUrl)
        .then(res => res.json())
        .then(data => setMetadata(data))
        .catch(err => console.error('Error fetching metadata:', err));
    }
  }, [tokenURI]);

  if (!balance || balance === 0n || !event) return null;

  const imageUrl = metadata?.image?.replace('ipfs://', 'https://ipfs.io/ipfs/');

  return (
    <div className="card hover:scale-105 transition">
      <div className="flex gap-6">
        {/* NFT Image */}
        <div className="flex-shrink-0">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Ticket NFT" 
              className="w-32 h-32 rounded-lg object-cover border-2 border-primary/50"
            />
          ) : (
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-4xl">
              🎟️
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{event.name}</h3>
          <div className="space-y-1 text-sm text-gray-300">
            <p>🎫 Token ID: #{eventId}</p>
            <p>💰 Paid: {formatETH(event.fee)} ETH</p>
            <p>📅 {formatDate(Number(event.deadline))}</p>
          </div>
          <Link 
            href={`/events/${eventId}`}
            className="inline-block mt-3 text-primary hover:underline text-sm"
          >
            View Event Details →
          </Link>
        </div>
      </div>

      {/* Metadata Attributes */}
      {metadata?.attributes && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex gap-2 flex-wrap">
            {metadata.attributes.map((attr: any, i: number) => (
              <span key={i} className="bg-white/5 px-3 py-1 rounded text-xs">
                {attr.trait_type}: {attr.value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}