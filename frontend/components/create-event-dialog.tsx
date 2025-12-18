"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { getContract, parseEther } from "@/lib/web3"
import { toast } from "sonner"

export function CreateEventDialog({ onEventCreated }: { onEventCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const { signer } = useWallet()

  const [formData, setFormData] = useState({
    name: "",
    fee: "",
    maxParticipants: "",
    deadline: "",
  })

  const isValidDate = (dateString: string) => {
    if (!dateString) return false
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime()) && date > new Date()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signer) {
      toast.error("Please connect your wallet")
      return
    }

    if (!isValidDate(formData.deadline)) {
      toast.error("Please enter a valid future date and time")
      return
    }

    try {
      setIsCreating(true)

      const contract = await getContract(signer)

      const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000)
      const feeInWei = parseEther(formData.fee)

      const tx = await contract.createEvent(
        formData.name,
        feeInWei,
        BigInt(formData.maxParticipants),
        BigInt(deadlineTimestamp),
      )

      toast.loading("Transaction sent, waiting for confirmation...")

      await tx.wait()

      toast.success("Event created successfully")
      setOpen(false)
      setFormData({ name: "", fee: "", maxParticipants: "", deadline: "" })
      onEventCreated?.()
    } catch (error: any) {
      let errorMessage = "Failed to create event"

      if (error.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected"
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for transaction"
      } else if (error.message?.includes("network") || error.message?.includes("RPC")) {
        errorMessage = "Network connection issue. Please check your MetaMask connection and try again."
      } else if (error.message?.includes("Invalid contract address")) {
        errorMessage = error.message
      } else if (error.reason) {
        errorMessage = error.reason
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>Create an on-chain event with NFT tickets for participants</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              placeholder="Web3 Conference 2025"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee">Registration Fee (ETH)</Label>
            <Input
              id="fee"
              type="number"
              step="0.001"
              placeholder="0.05"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Max Participants</Label>
            <Input
              id="maxParticipants"
              type="number"
              placeholder="100"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Registration Deadline</Label>
            <Input
              id="deadline"
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className={!formData.deadline || isValidDate(formData.deadline) ? "" : "border-destructive"}
              required
            />
            {formData.deadline && !isValidDate(formData.deadline) && (
              <p className="text-sm text-destructive">Please enter a valid future date</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isCreating} className="w-full">
              {isCreating ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
