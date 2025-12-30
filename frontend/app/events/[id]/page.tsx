'use client';

import { useParams } from 'next/navigation';
import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { CHAINPASS_ABI } from '@/lib/abi';
import { formatETH, formatDate, shortenAddress, isPast } from '@/lib/format';
import { Calendar, Users, DollarSign, User, CheckCircle, XCircle, Lock, Unlock } from 'lucide-react';
import { useEffect } from 'react';

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = BigInt(params.id as string);
  const { address } = useAccount();

  const { data: event, refetch: refetchEvent } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'getEventDetails',
    args: [eventId],
  });

  const { data: isRegistered, refetch: refetchRegistration } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'isRegistered',
    args: [eventId, address!],
    query: { enabled: !!address },
  });

  const { data: participants, refetch: refetchParticipants } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'getParticipants',
    args: [eventId],
  });

  const { writeContract, isPending, data: hash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      refetchEvent();
      refetchRegistration();
      refetchParticipants();
    }
  }, [isSuccess, refetchEvent, refetchRegistration, refetchParticipants]);

  if (!event) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="card animate-pulse h-96" />
      </div>
    );
  }

  const isOrganizer = address?.toLowerCase() === event.organizer.toLowerCase();
  const isEnded = isPast(Number(event.deadline));
  const isFull = event.participantCount >= event.maxParticipants;

  const handleRegister = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CHAINPASS_ABI,
      functionName: 'registerForEvent',
      args: [eventId],
      value: event.fee,
    });
  };

  const handleCancel = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CHAINPASS_ABI,
      functionName: 'cancelRegistration',
      args: [eventId],
    });
  };

  const handleOpenRegistration = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CHAINPASS_ABI,
      functionName: 'openRegistration',
      args: [eventId],
    });
  };

  const handleCloseRegistration = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CHAINPASS_ABI,
      functionName: 'closeRegistration',
      args: [eventId],
    });
  };

  const handleWithdraw = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CHAINPASS_ABI,
      functionName: 'withdrawFunds',
      args: [eventId],
    });
  };

  const isProcessing = isPending || isConfirming;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.name}</h1>
            <p className="text-gray-400">Event #{params.id}</p>
          </div>
          <div>
            {event.isOpen && !isEnded && !isFull && (
              <span className="bg-green-500/20 text-green-300 border border-green-500/50 px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
                <CheckCircle size={16} /> Open
              </span>
            )}
            {!event.isOpen && !isEnded && (
              <span className="bg-gray-500/20 text-gray-300 border border-gray-500/50 px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
                <Lock size={16} /> Closed
              </span>
            )}
            {isFull && (
              <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
                <Users size={16} /> Full
              </span>
            )}
            {isEnded && (
              <span className="bg-red-500/20 text-red-300 border border-red-500/50 px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
                <CheckCircle size={16} /> Ended
              </span>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <DollarSign size={16} className="text-primary" />
              Registration Fee
            </div>
            <p className="text-2xl font-bold">{formatETH(event.fee)} ETH</p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Users size={16} className="text-secondary" />
              Participants
            </div>
            <p className="text-2xl font-bold">
              {Number(event.participantCount)}/{Number(event.maxParticipants)}
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Calendar size={16} className="text-primary" />
              Deadline
            </div>
            <p className="font-bold text-sm">{formatDate(Number(event.deadline))}</p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <User size={16} className="text-secondary" />
              Organizer
            </div>
            <p className="font-mono text-sm font-bold">{shortenAddress(event.organizer)}</p>
          </div>
        </div>

        {!isOrganizer && address && (
          <div className="space-y-3">
            {!isRegistered && event.isOpen && !isEnded && !isFull && (
              <button 
                onClick={handleRegister} 
                disabled={isProcessing}
                className="btn-primary w-full"
              >
                {isProcessing ? 'Processing...' : `Register for ${formatETH(event.fee)} ETH`}
              </button>
            )}
            {isRegistered && !isEnded && (
              <button 
                onClick={handleCancel}
                disabled={isProcessing}
                className="btn-secondary w-full"
              >
                {isProcessing ? 'Processing...' : 'Cancel Registration & Get Refund'}
              </button>
            )}
            {isRegistered && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center">
                <CheckCircle className="inline-block mr-2" size={20} />
                <span className="text-green-300 font-semibold">You're registered!</span>
              </div>
            )}
          </div>
        )}

        {isOrganizer && (
          <div className="border-t border-white/10 pt-6 mt-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              Organizer Controls
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {!event.isOpen && !isEnded && (
                <button 
                  onClick={handleOpenRegistration}
                  disabled={isProcessing}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <Unlock size={18} />
                  {isProcessing ? 'Processing...' : 'Open Registration'}
                </button>
              )}
              {event.isOpen && !isEnded && (
                <button 
                  onClick={handleCloseRegistration}
                  disabled={isProcessing}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <Lock size={18} />
                  {isProcessing ? 'Processing...' : 'Close Registration'}
                </button>
              )}
              {isEnded && !event.fundsWithdrawn && Number(event.participantCount) > 0 && (
                <button 
                  onClick={handleWithdraw}
                  disabled={isProcessing}
                  className="btn-primary sm:col-span-2 flex items-center justify-center gap-2"
                >
                  <DollarSign size={18} />
                  {isProcessing ? 'Processing...' : `Withdraw ${formatETH(event.fee * event.participantCount)} ETH`}
                </button>
              )}
              {event.fundsWithdrawn && (
                <div className="sm:col-span-2 bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center">
                  <CheckCircle className="inline-block mr-2" size={20} />
                  <span className="text-green-300 font-semibold">Funds withdrawn</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Users size={20} className="text-secondary" />
          Participants ({participants?.length || 0})
        </h3>
        {participants && participants.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {participants.map((addr, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
              >
                <span className="font-mono text-sm">{shortenAddress(addr)}</span>
                {addr.toLowerCase() === address?.toLowerCase() && (
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Users size={48} className="mx-auto mb-3 opacity-30" />
            <p>No participants yet</p>
          </div>
        )}
      </div>
    </div>
  );
}