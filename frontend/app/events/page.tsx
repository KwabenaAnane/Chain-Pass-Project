'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { CHAINPASS_ABI } from '@/lib/abi';
import EventCard from '@/components/EventCard';

export default function EventsPage() {
  const { data: eventCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'eventCounter',
  });

  const total = eventCount ? Number(eventCount) : 0;
  const eventIds = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className='max-w-7xl mx-auto px-4 py-12'>
      <h1 className='text-4xl font-bold mb-8'>Browse Events</h1>

      {total === 0 ? (
        <div className='card text-center py-12'>
          <p className='text-gray-400'>
            No events yet. Be the first to create one!
          </p>
        </div>
      ) : (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {eventIds.map((id) => (
            <EventCard key={id} eventId={id} />
          ))}
        </div>
      )}
    </div>
  );
}
