'use client';

import { useParams } from 'next/navigation';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { CHAINPASS_ABI } from '@/lib/abi';
import { formatETH, formatDate, shortenAddress, isPast } from '@/lib/format';

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = BigInt(params.id as string);
  const { address } = useAccount();

  const { data: event } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'getEventDetails',
    args: [eventId],
  });

  const { data: isRegistered } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'isRegistered',
    args: [eventId, address!],
    query: { enabled: !!address },
  });

  const { data: participants } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'getParticipants',
    args: [eventId],
  });

  const { writeContract } = useWriteContract();

  if (!event) return <div className="max-w-4xl mx-auto px-4 py-12">Loading...</div>;

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="card mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
            <p className="text-gray-400">Event #{params.id}</p>
          </div>
          <div className="text-right">
            {event.isOpen && !isEnded && !isFull && (
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Open</span>
            )}
            {!event.isOpen && <span className="bg-gray-500 text-white px-3 py-1 rounded text-sm">Closed</span>}
            {isFull && <span className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">Full</span>}
            {isEnded && <span className="bg-red-500 text-white px-3 py-1 rounded text-sm">Ended</span>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-400 text-sm">Registration Fee</p>
            <p className="text-2xl font-bold">{formatETH(event.fee)} ETH</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Participants</p>
            <p className="text-2xl font-bold">{Number(event.participantCount)}/{Number(event.maxParticipants)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Deadline</p>
            <p className="font-bold">{formatDate(Number(event.deadline))}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Organizer</p>
            <p className="font-mono text-sm">{shortenAddress(event.organizer)}</p>
          </div>
        </div>

        {/* User Actions */}
        {!isOrganizer && address && (
          <div className="space-y-3">
            {!isRegistered && event.isOpen && !isEnded && !isFull && (
              <button onClick={handleRegister} className="btn-primary w-full">
                Register for Event
              </button>
            )}
            {isRegistered && !isEnded && (
              <button onClick={handleCancel} className="btn-secondary w-full">
                Cancel Registration
              </button>
            )}
            {isRegistered && (
              <p className="text-center text-green-400">✅ You're registered!</p>
            )}
          </div>
        )}

        {/* Organizer Actions */}
        {isOrganizer && (
          <div className="border-t border-white/10 pt-6 mt-6">
            <h3 className="font-bold mb-4">Organizer Controls</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {!event.isOpen && (
                <button onClick={handleOpenRegistration} className="btn-primary">
                  Open Registration
                </button>
              )}
              {event.isOpen && (
                <button onClick={handleCloseRegistration} className="btn-secondary">
                  Close Registration
                </button>
              )}
              {isEnded && !event.fundsWithdrawn && (
                <button onClick={handleWithdraw} className="btn-primary md:col-span-2">
                  Withdraw {formatETH(event.fee * event.participantCount)} ETH
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Participants List */}
      <div className="card">
        <h3 className="font-bold mb-4">Participants ({participants?.length || 0})</h3>
        {participants && participants.length > 0 ? (
          <div className="space-y-2">
            {participants.map((addr, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="font-mono text-sm">{shortenAddress(addr)}</span>
                {addr.toLowerCase() === address?.toLowerCase() && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">You</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No participants yet</p>
        )}
      </div>
    </div>
  );
}