'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { CHAINPASS_ABI } from '@/lib/abi';
import { isAddress } from 'viem';
import { Shield, CheckCircle, XCircle, Search, AlertCircle } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="text-primary" size={32} />
          <h1 className="text-3xl md:text-5xl font-bold">Verify Ticket</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Check if a wallet holds a valid event ticket
        </p>
      </div>
      
      <div className="card space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2 flex items-center gap-2">
            <span>Wallet Address</span>
            <span className="text-gray-500 text-xs font-normal">(Required)</span>
          </label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="input-field font-mono text-sm"
            placeholder="0x..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 flex items-center gap-2">
            <span>Event ID</span>
            <span className="text-gray-500 text-xs font-normal">(Required)</span>
          </label>
          <input
            type="number"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="input-field"
            placeholder="1"
            min="1"
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={checking}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Search size={20} />
          {checking ? 'Checking...' : 'Verify Ticket'}
        </button>

        {/* Result */}
        {balance !== undefined && (
          <div className={`p-8 rounded-2xl text-center transition-all duration-500 ${
            hasTicket 
              ? 'bg-green-500/20 border-2 border-green-500/50 shadow-lg shadow-green-500/20' 
              : 'bg-red-500/20 border-2 border-red-500/50 shadow-lg shadow-red-500/20'
          }`}>
            <div className="mb-4">
              {hasTicket ? (
                <CheckCircle size={64} className="mx-auto text-green-400 animate-pulse" />
              ) : (
                <XCircle size={64} className="mx-auto text-red-400 animate-pulse" />
              )}
            </div>
            
            <h2 className={`text-3xl font-bold mb-4 ${hasTicket ? 'text-green-300' : 'text-red-300'}`}>
              {hasTicket ? 'VALID TICKET' : 'INVALID TICKET'}
            </h2>
            
            {hasTicket && event && (
              <div className="mt-6 space-y-3 text-left bg-black/20 p-4 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Event:</span>
                  <span className="font-semibold">{event.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Event ID:</span>
                  <span className="font-mono font-semibold">#{eventId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Wallet:</span>
                  <span className="font-mono text-xs">
                    {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                  </span>
                </div>
              </div>
            )}
            
            <div className={`mt-6 py-3 px-6 rounded-xl font-bold text-lg ${
              hasTicket 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {hasTicket ? '✓ Allow Entry' : '✗ Deny Entry'}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="card mt-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-secondary" />
          How to Use
        </h3>
        <ol className="space-y-3 text-gray-300">
          <li className="flex gap-3">
            <span className="bg-gradient-purple text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
              1
            </span>
            <span>Ask attendee for their wallet address</span>
          </li>
          <li className="flex gap-3">
            <span className="bg-gradient-purple text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
              2
            </span>
            <span>Enter the event ID you want to verify</span>
          </li>
          <li className="flex gap-3">
            <span className="bg-gradient-purple text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
              3
            </span>
            <span>Click "Verify Ticket" to check on blockchain</span>
          </li>
          <li className="flex gap-3">
            <span className="bg-gradient-purple text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
              4
            </span>
            <span>Allow entry if ticket is valid ✓</span>
          </li>
        </ol>
      </div>
    </div>
  );
}