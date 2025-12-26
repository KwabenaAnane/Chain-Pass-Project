'use client';

import Link from 'next/link';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { CHAINPASS_ABI } from '@/lib/abi';
import { formatETH, formatDate, isPast } from '@/lib/format';
import { Calendar, Users, DollarSign } from 'lucide-react';

export default function EventCard({ eventId }: { eventId: number }) {
  const { data: event } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'getEventDetails',
    args: [BigInt(eventId)],
  });

  if (!event) {
    return (
      <div className='card animate-pulse h-64'>
        <div className='h-6 bg-white/10 rounded mb-4 w-3/4'></div>
        <div className='h-4 bg-white/10 rounded mb-2 w-1/2'></div>
        <div className='h-4 bg-white/10 rounded w-2/3'></div>
      </div>
    );
  }

  const isEnded = isPast(Number(event.deadline));
  const isFull = event.participantCount >= event.maxParticipants;

  let status = 'Closed';
  let statusColor = 'bg-white/10 text-white border-white/20'; 

  if (isEnded) {
    status = 'Ended';
    statusColor = 'bg-white/10 text-white border-white/20'; 
  } else if (isFull) {
    status = 'Full';
    statusColor = 'bg-white/10 text-white border-white/20'; 
  } else if (event.isOpen) {
    status = 'Open';
    statusColor = 'bg-primary/20 text-white border-primary/40'; 
  }

  return (
    <Link href={`/events/${eventId}`}>
      <div className='card hover:scale-105 transition-all duration-300 cursor-pointer h-full'>
        <div className='flex justify-between items-start mb-4'>
          <h3 className='text-xl font-bold line-clamp-2 flex-1 text-white'>
            {event.name}
          </h3>

          <span
            className={`${statusColor} text-xs px-3 py-1 rounded-full border font-semibold ml-2 whitespace-nowrap`}>
            {status}
          </span>
        </div>

        <div className='space-y-3 text-white'>
          <div className='flex items-center gap-2'>
            <DollarSign size={18} className='text-white' />
            <span className='font-semibold'>{formatETH(event.fee)} ETH</span>
          </div>

          <div className='flex items-center gap-2'>
            <Users size={18} className='text-white' />
            <span>
              {Number(event.participantCount)}/{Number(event.maxParticipants)}{' '}
              participants
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <Calendar size={18} className='text-white' />
            <span className='text-sm'>
              {formatDate(Number(event.deadline))}
            </span>
          </div>
        </div>

        <div className='mt-4 pt-4 border-t border-white/10'>
          <span className='text-white text-sm font-semibold'>
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
