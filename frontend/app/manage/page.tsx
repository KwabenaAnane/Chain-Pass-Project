'use client';

import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { CHAINPASS_ABI } from '@/lib/abi';
import Link from 'next/link';
import { formatETH, formatDate } from '@/lib/format';

export default function ManagePage() {
  const { address } = useAccount();

  const { data: eventCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'eventCounter',
  });

  if (!address) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="card text-center py-12">
          <p className="text-gray-400">Connect your wallet to manage your events</p>
        </div>
      </div>
    );
  }

  const total = eventCount ? Number(eventCount) : 0;
  const eventIds = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Manage Events</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {eventIds.map((id) => (
          <OrganizerEventCard key={id} eventId={id} userAddress={address} />
        ))}
      </div>
    </div>
  );
}

function OrganizerEventCard({ eventId, userAddress }: { eventId: number; userAddress: string }) {
  const { data: event } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'getEventDetails',
    args: [BigInt(eventId)],
  });

  if (!event || event.organizer.toLowerCase() !== userAddress.toLowerCase()) return null;

  const revenue = event.fee * event.participantCount;

  return (
    <Link href={`/events/${eventId}`}>
      <div className="card hover:scale-105 transition cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{event.name}</h3>
          {event.isOpen ? (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Open</span>
          ) : (
            <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">Closed</span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Participants</p>
            <p className="text-lg font-bold">{Number(event.participantCount)}/{Number(event.maxParticipants)}</p>
          </div>
          <div>
            <p className="text-gray-400">Revenue</p>
            <p className="text-lg font-bold">{formatETH(revenue)} ETH</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-400">Deadline: {formatDate(Number(event.deadline))}</p>
          {event.fundsWithdrawn && (
            <p className="text-xs text-green-400 mt-1">✅ Funds withdrawn</p>
          )}
        </div>
      </div>
    </Link>
  );
}