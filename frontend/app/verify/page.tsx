'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { CHAINPASS_ABI } from '@/lib/abi';
import { isAddress } from 'viem';

export default function VerifyPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [eventId, setEventId] = useState('');
  const [checking, setChecking] = useState(false);

  const { data: balance, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'balanceOf',
    args: [walletAddress as `0x${string}`, BigInt(eventId || 0)],
    query: { enabled: false },
  });

  const { data: event } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINPASS_ABI,
    functionName: 'getEventDetails',
    args: [BigInt(eventId || 0)],
    query: { enabled: !!eventId && balance !== undefined },
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
    await refetch();
    setChecking(false);
  };

  const hasTicket = balance !== undefined && balance > 0n;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Verify Ticket</h1>
      
      <div className="card space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">Wallet Address</label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary outline-none font-mono text-sm"
            placeholder="0x..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Event ID</label>
          <input
            type="number"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary outline-none"
            placeholder="1"
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={checking}
          className="btn-primary w-full"
        >
          {checking ? 'Checking...' : 'Verify Ticket'}
        </button>

        {balance !== undefined && (
          <div className={`p-8 rounded-xl text-center ${
            hasTicket 
              ? 'bg-green-500/20 border-2 border-green-500' 
              : 'bg-red-500/20 border-2 border-red-500'
          }`}>
            <div className="text-6xl mb-4">
              {hasTicket ? '✅' : '❌'}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {hasTicket ? 'VALID TICKET' : 'INVALID TICKET'}
            </h2>
            {hasTicket && event && (
              <div className="mt-4 text-left space-y-2">
                <p className="text-sm"><span className="text-gray-400">Event:</span> {event.name}</p>
                <p className="text-sm"><span className="text-gray-400">Event ID:</span> #{eventId}</p>
                <p className="text-sm font-mono"><span className="text-gray-400">Wallet:</span> {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}</p>
              </div>
            )}
            <p className="mt-4 text-lg font-bold">
              {hasTicket ? '✓ Allow Entry' : '✗ Deny Entry'}
            </p>
          </div>
        )}
      </div>

      <div className="card mt-6">
        <h3 className="font-bold mb-3">How to Use</h3>
        <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
          <li>Ask attendee for their wallet address</li>
          <li>Enter the event ID you want to verify</li>
          <li>Click "Verify Ticket"</li>
          <li>Allow entry if valid ✓</li>
        </ol>
      </div>
    </div>
  );
}