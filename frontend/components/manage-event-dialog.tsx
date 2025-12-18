"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/hooks/use-wallet"
import { getContract, formatEther } from "@/lib/web3"
import { PlayCircle, PauseCircle, XCircle, Wallet } from "lucide-react"
import { toast } from "sonner"

interface ManageEventDialogProps {
  eventId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventUpdated?: () => void
}

export function ManageEventDialog({ eventId, open, onOpenChange, onEventUpdated }: ManageEventDialogProps) {
  const [event, setEvent] = useState<any>(null)
  const [participants, setParticipants] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { signer, provider } = useWallet()

  useEffect(() => {
    if (open && eventId && provider) {
      loadEventDetails()
    }
  }, [open, eventId, provider])

  const loadEventDetails = async () => {
    if (!provider || !eventId) return

    try {
      const contract = getContract(provider)
      const eventDetails = await contract.getEventDetails(eventId)
      //const eventParticipants = await contract.getParticipants(eventId)

      setEvent(eventDetails)
     // setParticipants(eventParticipants)
    } catch (error) {
      console.error("Failed to load event details:", error)
    }
  }

  const handleAction = async (action: "open" | "pause" | "reopen" | "close" | "withdraw") => {
    if (!signer || !eventId) return

    try {
      setIsLoading(true)
      const contract = getContract(signer)
      let tx

      switch (action) {
        case "open":
          tx = await contract.openRegistration(eventId)
          break
        case "pause":
          tx = await contract.pauseRegistration(eventId)
          break
        case "reopen":
          tx = await contract.reopenRegistration(eventId)
          break
        case "close":
          tx = await contract.closeRegistration(eventId)
          break
        case "withdraw":
          tx = await contract.withdrawFunds(eventId)
          break
      }

      await tx.wait()
      toast.success( `Action completed successfully`)
      await loadEventDetails()
      onEventUpdated?.()
    } catch (error: any) {
      console.error("Action failed:", error)
      toast.error(error.message || "Action failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (!event) return null

  const deadlineDate = new Date(Number(event.deadline) * 1000)
  const isPast = deadlineDate < new Date()
  const totalFunds = BigInt(event.fee) * BigInt(event.participantCount)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{event.name}</DialogTitle>
          <DialogDescription className="font-mono text-xs">Event #{eventId}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <div>
                {event.isOpen && !isPast ? (
                  <Badge>Open</Badge>
                ) : isPast ? (
                  <Badge variant="outline">Ended</Badge>
                ) : (
                  <Badge variant="secondary">Closed</Badge>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="text-lg font-semibold">
                {Number(event.participantCount)} / {Number(event.maxParticipants)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Registration Fee</p>
              <p className="font-mono text-lg font-semibold">{formatEther(event.fee)} ETH</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Funds</p>
              <p className="font-mono text-lg font-semibold">{formatEther(totalFunds)} ETH</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">Registration Controls</p>
            <div className="grid grid-cols-2 gap-2">
              {!event.isOpen && !isPast && (
                <Button onClick={() => handleAction("open")} disabled={isLoading} variant="outline" className="gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Open Registration
                </Button>
              )}
              {event.isOpen && !isPast && (
                <Button onClick={() => handleAction("pause")} disabled={isLoading} variant="outline" className="gap-2">
                  <PauseCircle className="h-4 w-4" />
                  Pause
                </Button>
              )}
              {!event.isOpen && !isPast && (
                <Button onClick={() => handleAction("reopen")} disabled={isLoading} variant="outline" className="gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Reopen
                </Button>
              )}
              {event.isOpen && !isPast && (
                <Button onClick={() => handleAction("close")} disabled={isLoading} variant="outline" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Close
                </Button>
              )}
            </div>
          </div>

          {isPast && Number(event.participantCount) > 0 && (
            <>
              <Separator />
              <Button onClick={() => handleAction("withdraw")} disabled={isLoading} className="w-full gap-2">
                <Wallet className="h-4 w-4" />
                Withdraw {formatEther(totalFunds)} ETH
              </Button>
            </>
          )}

          {participants.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium">Participants ({participants.length})</p>
                <div className="max-h-[200px] space-y-2 overflow-y-auto rounded-lg border p-3">
                  {participants.map((address, index) => (
                    <div key={index} className="font-mono text-xs text-muted-foreground">
                      {address}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
