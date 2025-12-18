'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Ticket, Copy, CheckCircle2 } from 'lucide-react';
import { formatEther, CHAINPASS_ADDRESS, SUPPORTED_CHAINS } from '@/lib/web3';
import { useState } from 'react';
import { toast } from 'sonner';

interface TicketDetailDialogProps {
  event: {
    id: number;
    name: string;
    fee: bigint;
    maxParticipants: bigint;
    deadline: bigint;
    organizer: string;
    isOpen: boolean;
    participantCount: bigint;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketDetailDialog({
  event,
  open,
  onOpenChange,
}: TicketDetailDialogProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!event) return null;

  const deadlineDate = new Date(Number(event.deadline) * 1000);
  const tokenId = event.id;
  const blockExplorerUrl = `${SUPPORTED_CHAINS.sepolia.blockExplorers.default.url}/address/${CHAINPASS_ADDRESS}`;
  const tokenUrl = `${SUPPORTED_CHAINS.sepolia.blockExplorers.default.url}/token/${CHAINPASS_ADDRESS}?a=${tokenId}`;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Ticket className='h-5 w-5' />
            NFT Ticket Details
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Visual Ticket Card */}
          <div className='relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-purple-600/10 p-8'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-pink-600/20' />

            <div className='relative space-y-4'>
              <div className='flex items-start justify-between'>
                <div className='space-y-2'>
                  <Badge className='bg-gradient-to-r from-purple-600 to-pink-600 text-white'>
                    <CheckCircle2 className='mr-1 h-3 w-3' />
                    Registered
                  </Badge>
                  <h3 className='text-2xl font-bold tracking-tight'>
                    {event.name}
                  </h3>
                  <p className='font-mono text-sm text-muted-foreground'>
                    Token ID: #{tokenId}
                  </p>
                </div>
                <div className='rounded-lg border border-border/50 bg-background/50 p-3 backdrop-blur-sm'>
                  <Ticket className='h-8 w-8 text-purple-400' />
                </div>
              </div>

              <Separator className='bg-border/50' />

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>
                    Registration Fee
                  </p>
                  <p className='font-mono text-lg font-semibold'>
                    {formatEther(event.fee)} ETH
                  </p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Event Date</p>
                  <p className='text-sm font-medium'>
                    {deadlineDate.toLocaleDateString()}
                  </p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Participants</p>
                  <p className='text-sm font-medium'>
                    {Number(event.participantCount)} /{' '}
                    {Number(event.maxParticipants)}
                  </p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Network</p>
                  <p className='text-sm font-medium'>
                    {SUPPORTED_CHAINS.sepolia.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain Details */}
          <div className='space-y-4'>
            <h4 className='text-sm font-semibold'>Blockchain Information</h4>

            <div className='space-y-3'>
              <div className='flex items-center justify-between rounded-lg border bg-card p-3'>
                <div className='min-w-0 flex-1 space-y-1'>
                  <p className='text-xs text-muted-foreground'>
                    Contract Address
                  </p>
                  <p className='truncate font-mono text-sm'>
                    {CHAINPASS_ADDRESS}
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() =>
                    copyToClipboard(CHAINPASS_ADDRESS, 'Contract Address')
                  }>
                  {copied === 'Contract Address' ? (
                    <CheckCircle2 className='h-4 w-4 text-green-500' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </div>

              <div className='flex items-center justify-between rounded-lg border bg-card p-3'>
                <div className='min-w-0 flex-1 space-y-1'>
                  <p className='text-xs text-muted-foreground'>Token ID</p>
                  <p className='font-mono text-sm'>#{tokenId}</p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() =>
                    copyToClipboard(tokenId.toString(), 'Token ID')
                  }>
                  {copied === 'Token ID' ? (
                    <CheckCircle2 className='h-4 w-4 text-green-500' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </div>

              <div className='flex items-center justify-between rounded-lg border bg-card p-3'>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Chain ID</p>
                  <p className='font-mono text-sm'>
                    {SUPPORTED_CHAINS.sepolia.id}
                  </p>
                </div>
                <Badge variant='outline'>
                  {SUPPORTED_CHAINS.sepolia.network}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3'>
            <Button
              className='flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              onClick={() => window.open(tokenUrl, '_blank')}>
              <ExternalLink className='mr-2 h-4 w-4' />
              View on Etherscan
            </Button>
            <Button
              variant='outline'
              onClick={() => window.open(blockExplorerUrl, '_blank')}>
              <ExternalLink className='mr-2 h-4 w-4' />
              Contract
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
