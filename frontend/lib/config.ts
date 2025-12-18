import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

// Contract address
export const CONTRACT_ADDRESS = "0x3A52c1AB2Ef9033f4F25d15F5e0Bf9624d63EA5D" as const;

// Wagmi config
export const config = getDefaultConfig({
  appName: 'ChainPass',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!, 
  chains: [sepolia],
  ssr: true,
});