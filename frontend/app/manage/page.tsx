'use client';

import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { CHAINPASS_ABI } from '@/lib/abi';
import Link from 'next/link';
import { formatETH, formatDate } from '@/lib/format';
import { Briefcase, Users, DollarSign, Calendar, CheckCircle, Lock, Unlock } from 'lucide-react';

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
        <div className="card text-center py-16">
          <Briefcase size={64} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400 text-lg">Connect your wallet to manage your events</p>
        </div>
      </div>
    );
  }

  const total = eventCount ? Number(eventCount) : 0;
  const eventIds = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 mb-3">
          <Briefcase className="text-primary" size={32} />
          <h1 className="text-3xl md:text-5xl font-bold">Manage Events</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Control your created events and withdraw funds
        </p>
      </div>
      
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
  const fillPercentage = (Number(event.participantCount) / Number(event.maxParticipants)) * 100;

  return (
    <Link href={`/events/${eventId}`}>
      <div className="card hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold flex-1 line-clamp-2">{event.name}</h3>
          {event.isOpen ? (
            <span className="bg-green-500/20 text-green-300 border border-green-500/50 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ml-2">
              <Unlock size={12} /> Open
            </span>
          ) : (
            <span className="bg-gray-500/20 text-gray-300 border border-gray-500/50 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ml-2">
              <Lock size={12} /> Closed
            </span>
          )}
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Users size={14} />
              Participants
            </div>
            <p className="text-lg font-bold">
              {Number(event.participantCount)}/{Number(event.maxParticipants)}
            </p>
            {/* Progress Bar */}
            <div className="mt-2 bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-purple h-full transition-all duration-500"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <DollarSign size={14} />
              Revenue
            </div>
            <p className="text-lg font-bold">{formatETH(revenue)} ETH</p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar size={14} className="text-primary" />
            {formatDate(Number(event.deadline))}
          </div>
          
          {event.fundsWithdrawn && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle size={14} />
              Funds withdrawn
            </div>
          )}
        </div>

        <div className="mt-4">
          <span className="text-primary hover:text-secondary transition-colors text-sm font-semibold">
            Manage Event →
          </span>
        </div>
      </div>
    </Link>
  );
}