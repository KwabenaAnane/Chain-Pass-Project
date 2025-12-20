'use client';

import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { CHAINPASS_ABI } from '@/lib/abi';
import Link from 'next/link';
import { formatETH, formatDate } from '@/lib/format';

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

  if (!balance || balance === 0n || !event) return null;

  return (
    <Link href={`/events/${eventId}`}>
      <div className="card hover:scale-105 transition cursor-pointer">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">{event.name}</h3>
            <div className="space-y-1 text-sm text-gray-300">
              <p>🎫 Ticket #{eventId}</p>
              <p>💰 Paid: {formatETH(event.fee)} ETH</p>
              <p>📅 {formatDate(Number(event.deadline))}</p>
            </div>
          </div>
          <div className="text-6xl">🎟️</div>
        </div>
      </div>
    </Link>
  );
}