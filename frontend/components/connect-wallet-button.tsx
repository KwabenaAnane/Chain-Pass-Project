"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"

export function ConnectWalletButton() {
  const { address, connect, disconnect, isConnecting } = useWallet()

  if (address) {
    return (
      <Button variant="outline" onClick={disconnect} className="font-mono text-sm bg-transparent">
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    )
  }

  return (
    <Button onClick={connect} disabled={isConnecting} className="font-medium">
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
