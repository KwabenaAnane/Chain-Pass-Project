"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Wallet } from "lucide-react"
import { formatEther } from "@/lib/web3"

interface EventCardProps {
  event: {
    id: number
    name: string
    fee: bigint
    maxParticipants: bigint
    deadline: bigint
    organizer: string
    isOpen: boolean
    participantCount: bigint
  }
  onRegister?: (eventId: number) => void
  onManage?: (eventId: number) => void
  onViewTicket?: (eventId: number) => void
  isOrganizer?: boolean
  isRegistered?: boolean
}

export function EventCard({ event, onRegister, onManage, onViewTicket, isOrganizer, isRegistered }: EventCardProps) {
  const deadlineDate = new Date(Number(event.deadline) * 1000)
  const isFull = event.participantCount >= event.maxParticipants
  const isPast = deadlineDate < new Date()

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:shadow-purple-600/20 hover:border-purple-600/50">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-600/5 to-pink-600/5 opacity-0 transition-opacity group-hover:opacity-100" />

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl leading-tight">{event.name}</CardTitle>
            <CardDescription className="font-mono text-xs">Event #{event.id}</CardDescription>
          </div>
          {event.isOpen && !isPast && !isFull ? (
            <Badge className="shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white">Open</Badge>
          ) : isFull ? (
            <Badge variant="secondary" className="shrink-0">
              Full
            </Badge>
          ) : isPast ? (
            <Badge variant="outline" className="shrink-0">
              Ended
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0">
              Closed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wallet className="h-4 w-4" />
          <span className="font-mono">{formatEther(event.fee)} ETH</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {Number(event.participantCount)} / {Number(event.maxParticipants)} participants
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {deadlineDate.toLocaleDateString()} at {deadlineDate.toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        {isOrganizer ? (
          <Button onClick={() => onManage?.(event.id)} variant="outline" className="w-full">
            Manage Event
          </Button>
        ) : isRegistered ? (
          <Button
            onClick={() => onViewTicket?.(event.id)}
            className="w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30"
          >
            View My Ticket ✓
          </Button>
        ) : (
          <Button
            onClick={() => onRegister?.(event.id)}
            disabled={!event.isOpen || isFull || isPast}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isFull ? "Event Full" : isPast ? "Event Ended" : "Register Now"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
