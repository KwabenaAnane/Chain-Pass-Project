'use client';

import { useState } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { CHAINPASS_ABI } from '@/lib/abi';
import { isAddress } from 'viem';
import {
  Shield,
  CheckCircle,
  XCircle,
  Search,
  User,
} from 'lucide-react';

export default function VerifyPage() {
  const { address } = useAccount();
  const [walletAddress, setWalletAddress] = useState('');
  const [eventId, setEventId] = useState('');
  const [checking, setChecking] = useState(false);

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'balanceOf',
    args: [walletAddress as `0x${string}`, BigInt(eventId || 0)],
    query: { enabled: false },
  });

  const { data: event, refetch: refetchEvent } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'getEventDetails',
    args: [BigInt(eventId || 0)],
    query: { enabled: false },
  });

  const handleVerify = async () => {
    if (!isAddress(walletAddress)) {
      alert('Invalid wallet address');
      return;
    }
    if (!eventId) {
      alert('Enter event ID');
      return;
    }

    setChecking(true);
    await refetchBalance();
    await refetchEvent();
    setChecking(false);
  };

  const hasTicket = balance !== undefined && balance > 0n;
  const isOrganizer = event && address?.toLowerCase() === event.organizer.toLowerCase();
  const canVerify = hasTicket || isOrganizer;

  return (
    <div className='max-w-3xl mx-auto px-4 py-8 md:py-12'>
      <div className='mb-8 md:mb-12'>
        <div className='flex items-center gap-3 mb-3'>
          <Shield className='text-primary ' size={32} />
          <h1 className='text-3xl md:text-5xl font-bold '>Verify Ticket</h1>
        </div>
        <p className='text-gray-400 text-lg'>
          Check if a wallet holds a valid event ticket
        </p>
      </div>

      <div className='card space-y-8'>
        <div className='space-y-2'>
          <label className='block text-sm font-bold mb-2 flex items-center gap-2'>
            <span>Wallet Address*</span>
          </label>
          <input
            type='text'
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className='input-field font-mono text-sm'
            placeholder='0x...'
          />
        </div>

        <div className='space-y-2'>
          <label className='block text-sm font-bold flex items-center gap-2'>
            <span>Event ID*</span>
          </label>
          <input
            type='number'
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className='input-field'
            placeholder='1'
            min='1'
          />
        </div>

        <div className='pt-4'>
          <button 
            onClick={handleVerify}
            disabled={checking}
            className='btn-primary w-full flex items-center justify-center gap-2'>
            <Search size={20} />
            {checking ? 'Checking...' : 'Verify Ticket'}
          </button>
        </div>

        {/* Result */}
        {balance !== undefined && event && (
          <div
            className={`p-8 rounded-2xl text-center transition-all duration-500 ${
              hasTicket
                ? 'bg-green-500/20 border-2 border-green-500/50 shadow-lg shadow-green-500/20'
                : 'bg-red-500/20 border-2 border-red-500/50 shadow-lg shadow-red-500/20'
            }`}>
            <div className='mb-4'>
              {hasTicket ? (
                <CheckCircle
                  size={64}
                  className='mx-auto text-green-400 animate-pulse'
                />
              ) : (
                <XCircle
                  size={64}
                  className='mx-auto text-red-400 animate-pulse'
                />
              )}
            </div>

            <h2
              className={`text-3xl font-bold mb-4 ${
                hasTicket ? 'text-green-300' : 'text-red-300'
              }`}>
              {hasTicket ? 'VALID TICKET' : 'INVALID TICKET'}
            </h2>

            {event && (
              <div className='mt-6 space-y-3 text-left bg-black/20 p-4 rounded-xl'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-400'>Event:</span>
                  <span className='font-semibold'>{event.name}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-400'>Event ID:</span>
                  <span className='font-mono font-semibold'>#{eventId}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-400'>Wallet:</span>
                  <span className='font-mono text-xs'>
                    {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                  </span>
                </div>
                {isOrganizer && (
                  <div className='flex justify-between text-sm border-t border-white/10 pt-3 mt-3'>
                    <span className='text-gray-400'>Your Role:</span>
                    <span className='font-semibold text-primary flex items-center gap-1'>
                      <User size={14} />
                      Event Organizer
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Entry Decision - Only show if user can verify */}
            {canVerify && (
              <div
                className={`mt-6 py-3 px-6 rounded-xl font-bold text-lg ${
                  hasTicket ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                {hasTicket ? '✓ Allow Entry' : '✗ Deny Entry'}
              </div>
            )}

            {/* Access Denied for non-organizers without ticket */}
            {!canVerify && (
              <div className='mt-6 py-3 px-6 rounded-xl font-bold text-lg bg-gray-500/50 text-gray-300 border border-gray-500'>
                ⚠ Access Denied: You are not the organizer or ticket holder
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}