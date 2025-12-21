'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { CHAINPASS_ABI } from '@/lib/abi';
import EventCard from '@/components/EventCard';
import { Sparkles } from 'lucide-react';

export default function EventsPage() {
  const { data: eventCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'eventCounter',
  });

  const total = eventCount ? Number(eventCount) : 0;
  const eventIds = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="text-primary" size={32} />
          <h1 className="text-3xl md:text-5xl font-bold">Browse Events</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Discover and register for upcoming events
        </p>
      </div>
      
      {total === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🎭</div>
          <p className="text-gray-400 text-lg mb-6">No events yet. Be the first to create one!</p>
          <a href="/create" className="btn-primary inline-block">
            Create Event
          </a>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventIds.map((id) => (
            <EventCard key={id} eventId={id} />
          ))}
        </div>
      )}
    </div>
  );
}