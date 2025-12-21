'use client';

import Link from 'next/link';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { CHAINPASS_ABI } from '@/lib/abi';
import { formatETH, formatDate, isPast } from '@/lib/format';

export default function EventCard({ eventId }: { eventId: number }) {
  const { data: event } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'getEventDetails',
    args: [BigInt(eventId)],
  });

  if (!event) return <div className="card animate-pulse h-48" />;

  const isEnded = isPast(Number(event.deadline));
  const isFull = event.participantCount >= event.maxParticipants;
  
  let status = 'Closed';
  let statusColor = 'bg-gray-500';
  
  if (isEnded) {
    status = 'Ended';
    statusColor = 'bg-red-500';
  } else if (isFull) {
    status = 'Full';
    statusColor = 'bg-yellow-500';
  } else if (event.isOpen) {
    status = 'Open';
    statusColor = 'bg-green-500';
  }

  return (
    <Link href={`/events/${eventId}`}>
      <div className="card hover:scale-105 transition cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{event.name}</h3>
          <span className={`${statusColor} text-white text-xs px-2 py-1 rounded`}>
            {status}
          </span>
        </div>
        
        <div className="space-y-2 text-sm text-gray-300">
          <p>💰 Fee: {formatETH(event.fee)} ETH</p>
          <p>👥 {Number(event.participantCount)}/{Number(event.maxParticipants)} participants</p>
          <p>📅 {formatDate(Number(event.deadline))}</p>
        </div>
      </div>
    </Link>
  );
}