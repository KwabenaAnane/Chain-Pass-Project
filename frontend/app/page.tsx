"use client"

import { useState, useEffect } from "react"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { EventCard } from "@/components/event-card"
import { CreateEventDialog } from "@/components/create-event-dialog"
import { ManageEventDialog } from "@/components/manage-event-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/hooks/use-wallet"
import { getContract } from "@/lib/web3"
import { toast } from "sonner"
import { Ticket } from "lucide-react"
import { TicketDetailDialog } from "@/components/ticket-detail-dialog"

interface Event {
  id: number
  name: string
  fee: bigint
  maxParticipants: bigint
  deadline: bigint
  organizer: string
  isOpen: boolean
  participantCount: bigint
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [registeredEvents, setRegisteredEvents] = useState<Set<number>>(new Set())
  const [organizedEvents, setOrganizedEvents] = useState<Set<number>>(new Set())
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [selectedTicketEvent, setSelectedTicketEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { address, provider, signer } = useWallet()

  useEffect(() => {
    if (provider) {
      loadEvents()
    }
  }, [provider, address])

  const loadEvents = async () => {
    if (!provider) return

    try {
      setIsLoading(true)
      const contract = await getContract(provider)
      const eventCount = await contract.eventCounter()

      const loadedEvents: Event[] = []
      const registered = new Set<number>()
      const organized = new Set<number>()

      for (let i = 1; i <= Number(eventCount); i++) {
        const eventDetails = await contract.getEventDetails(i)

        loadedEvents.push({
          id: i,
          name: eventDetails.name,
          fee: eventDetails.fee,
          maxParticipants: eventDetails.maxParticipants,
          deadline: eventDetails.deadline,
          organizer: eventDetails.organizer,
          isOpen: eventDetails.isOpen,
          participantCount: eventDetails.participantCount,
        })

        if (address) {
          const isReg = await contract.isRegistered(i, address)
          if (isReg) registered.add(i)

          if (eventDetails.organizer.toLowerCase() === address.toLowerCase()) {
            organized.add(i)
          }
        }
      }

      setEvents(loadedEvents.reverse())
      setRegisteredEvents(registered)
      setOrganizedEvents(organized)
    } catch (error) {
      console.error("Failed to load events:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (eventId: number) => {
    if (!signer) {
      toast.error("Please connect your wallet")
      return
    }

    try {
      const contract = await getContract(signer)
      const event = events.find((e) => e.id === eventId)
      if (!event) return

      const tx = await contract.registerForEvent(eventId, { value: event.fee })
      await tx.wait()

      toast.success("You have been registered for the event")
      await loadEvents()
    } catch (error: any) {
      console.error("Registration failed:", error)
      toast.error(error.message || "Registration failed")
    }
  }

  const handleManage = (eventId: number) => {
    setSelectedEventId(eventId)
    setManageDialogOpen(true)
  }

  const handleViewTicket = (eventId: number) => {
    const event = events.find((e) => e.id === eventId)
    if (event) {
      setSelectedTicketEvent(event)
      setTicketDialogOpen(true)
    }
  }

  const myEvents = events.filter((e) => registeredEvents.has(e.id))
  const myOrganizedEvents = events.filter((e) => organizedEvents.has(e.id))
  const availableEvents = events.filter((e) => !organizedEvents.has(e.id))

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-950/20 via-background to-pink-950/20" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent" />

      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/20">
              <Ticket className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">ChainPass</h1>
          </div>
          <ConnectWalletButton />
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-balance bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
            On-chain Event Registration
          </h2>
          <p className="mx-auto max-w-[600px] text-pretty text-lg text-muted-foreground">
            Create and register for events with crypto. Get NFT tickets on the blockchain.
          </p>
        </div>

        {!address ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-muted-foreground">Connect your wallet to get started</p>
          </div>
        ) : (
          <Tabs defaultValue="browse" className="space-y-8">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="browse">Browse Events</TabsTrigger>
                <TabsTrigger value="my-tickets">My Tickets ({myEvents.length})</TabsTrigger>
                <TabsTrigger value="organize">Organize ({myOrganizedEvents.length})</TabsTrigger>
              </TabsList>
              <CreateEventDialog onEventCreated={loadEvents} />
            </div>

            <TabsContent value="browse" className="space-y-6">
              {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-[280px] animate-pulse rounded-lg bg-card" />
                  ))}
                </div>
              ) : availableEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <p className="text-muted-foreground">No events available yet</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {availableEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRegister={handleRegister}
                      isRegistered={registeredEvents.has(event.id)}
                      onViewTicket={handleViewTicket}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-tickets" className="space-y-6">
              {myEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <p className="text-muted-foreground">You haven't registered for any events yet</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {myEvents.map((event) => (
                    <EventCard key={event.id} event={event} isRegistered={true} onViewTicket={handleViewTicket} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="organize" className="space-y-6">
              {myOrganizedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <p className="text-muted-foreground">You haven't created any events yet</p>
                  <CreateEventDialog onEventCreated={loadEvents} />
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {myOrganizedEvents.map((event) => (
                    <EventCard key={event.id} event={event} onManage={handleManage} isOrganizer={true} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <ManageEventDialog
        eventId={selectedEventId}
        open={manageDialogOpen}
        onOpenChange={setManageDialogOpen}
        onEventUpdated={loadEvents}
      />

      <TicketDetailDialog event={selectedTicketEvent} open={ticketDialogOpen} onOpenChange={setTicketDialogOpen} />
    </div>
  )
}
