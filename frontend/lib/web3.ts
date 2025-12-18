import { ethers } from "ethers"
import { CHAINPASS_ADDRESS, CHAINPASS_ABI, SUPPORTED_CHAINS } from "./contract-config"

// ------------------- PROVIDERS -------------------

// Cached browser provider (MetaMask)
let cachedBrowserProvider: ethers.BrowserProvider | null = null

// Cached Alchemy provider (read-only)
let cachedAlchemyProvider: ethers.JsonRpcProvider | null = null

/**
 * Get MetaMask provider (for write/signing transactions)
 */
export async function getBrowserProvider() {
  if (typeof (window).ethereum === "undefined") {
    throw new Error("MetaMask is not installed. Please install MetaMask to use this app.")
  }

  if (!cachedBrowserProvider) {
    cachedBrowserProvider = new ethers.BrowserProvider(window.ethereum)
  }

  return cachedBrowserProvider
}

/**
 * Get Alchemy provider (read-only)
 */
export function getAlchemyProvider() {
  if (!cachedAlchemyProvider) {
    const rpcUrl = SUPPORTED_CHAINS.sepolia.rpcUrls.default.http[0]
    cachedAlchemyProvider = new ethers.JsonRpcProvider(rpcUrl)
  }
  return cachedAlchemyProvider
}

// ------------------- WALLET -------------------

/**
 * Connect to MetaMask wallet
 */
export async function connectWallet() {
  const provider = await getBrowserProvider()
  const accounts = await provider.send("eth_requestAccounts", [])
  const signer = await provider.getSigner()
  return { provider, signer, address: accounts[0] }
}

// ------------------- CONTRACT HELPERS -------------------

/**
 * Get contract instance
 */
export function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  if (!ethers.isAddress(CHAINPASS_ADDRESS) || CHAINPASS_ADDRESS === ethers.ZeroAddress) {
    throw new Error(
      "Invalid contract address. Please update CHAINPASS_ADDRESS in contract-config.ts with your deployed contract."
    )
  }
  return new ethers.Contract(CHAINPASS_ADDRESS, CHAINPASS_ABI, signerOrProvider)
}

/**
 * Get read-only contract (Alchemy)
 */
export function getReadOnlyContract() {
  const provider = getAlchemyProvider()
  return getContract(provider)
}

/**
 * Get write contract (MetaMask signer)
 */
export async function getWriteContract() {
  const { signer } = await connectWallet()
  return getContract(signer)
}

export function formatEther(value: bigint) {
  return ethers.formatEther(value)
}

export function parseEther(value: string) {
  return ethers.parseEther(value)
}
export { CHAINPASS_ADDRESS, CHAINPASS_ABI, SUPPORTED_CHAINS }
