'use client';

import { useState, useEffect } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { CHAINPASS_ABI } from '@/lib/abi';
import { toWei } from '@/lib/format';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CreateEventPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [fee, setFee] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [deadline, setDeadline] = useState('');

  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash!,
      query: { enabled: !!txHash },
    });

  const isLoading = isSubmitting || isConfirming;

  useEffect(() => {
    if (!isSuccess) return;

    const timer = setTimeout(() => {
      router.push('/events');
    }, 2000);

    return () => clearTimeout(timer);
  }, [isSuccess, router]);

  const inputClass =
    'input-field w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-200 placeholder:text-gray-500 text-sm focus:border-primary focus:ring-1 focus:ring-primary/40 outline-none transition';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const deadlineTimestamp = Math.floor(
        new Date(deadline).getTime() / 1000
      );

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CHAINPASS_ABI,
        functionName: 'createEvent',
        args: [
          name,
          toWei(fee),
          BigInt(maxParticipants),
          BigInt(deadlineTimestamp),
        ],
      });

      setTxHash(hash);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* PAGE LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-gray-300 text-sm">
              Creating event on-chain…
            </p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-10">
          Create Event
        </h1>

        <form
          onSubmit={handleSubmit}
          className="card space-y-8"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Event Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Blockchain Conference 2025"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Registration Fee (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className={inputClass}
              placeholder="0.1"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Max Participants
            </label>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) =>
                setMaxParticipants(e.target.value)
              }
              className={inputClass}
              placeholder="100"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Deadline
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) =>
                setDeadline(e.target.value)
              }
              className={inputClass}
              required
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          >
            {isLoading && (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
            {isLoading ? 'Creating...' : 'Create Event'}
          </button>

          {isSuccess && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 text-center">
              ✅ Event created! Redirecting…
            </div>
          )}
        </form>
      </div>
    </>
  );
}
