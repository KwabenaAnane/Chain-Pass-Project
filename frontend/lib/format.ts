import { formatEther, parseEther } from 'viem';

// Format wei to ETH
export const formatETH = (wei: bigint | string): string => {
  return formatEther(BigInt(wei));
};

// Parse ETH to wei
export const toWei = (eth: string): bigint => {
  return parseEther(eth);
};

// Shorten address: 0x1234...5678
export const shortenAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format unix timestamp to readable date
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

// Check if deadline passed
export const isPast = (timestamp: number): boolean => {
  return Date.now() / 1000 > timestamp;
};