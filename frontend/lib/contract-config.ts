// Contract configuration
//export const CHAINPASS_ADDRESS = "0x28fcaC4E1BBF3e6F101E4cFf91108D76C3C70bEd" as const
export const CHAINPASS_ADDRESS = "0x23e47c38Ba637a83c4FB03ADd55995C4a254b5cf" as const

export const SUPPORTED_CHAINS = {
  sepolia: {
    id: 11155111,
    name: "Sepolia",
    network: "sepolia",
    nativeCurrency: {
      decimals: 18,
      name: "Sepolia Ether",
      symbol: "ETH",
    },
    rpcUrls: {
     default: { http: [`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`] },
      public: { http: [`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`] },
    },
    blockExplorers: {
      default: { name: "Etherscan", url: "https://sepolia.etherscan.io" },
    },
    testnet: true,
  },
} as const

// ==============================
// ChainPass Contract ABI
// Source: Etherscan (verified)
// ==============================
export const CHAINPASS_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },

  // -------- Errors --------
  { inputs: [], name: "AlreadyRegistered", type: "error" },
  { inputs: [], name: "CannotCancelAfterDeadline", type: "error" },
  { inputs: [], name: "DeadlineMustBeFuture", type: "error" },
  { inputs: [], name: "EventDoesNotExist", type: "error" },
  { inputs: [], name: "EventFull", type: "error" },
  { inputs: [], name: "IncorrectFee", type: "error" },
  { inputs: [], name: "NotRegistered", type: "error" },
  { inputs: [], name: "OnlyOrganizer", type: "error" },
  { inputs: [], name: "RegistrationClosed", type: "error" },

  // -------- Events --------
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "eventId", type: "uint256" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: true, internalType: "address", name: "organizer", type: "address" },
      { indexed: false, internalType: "uint256", name: "fee", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "maxParticipants", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "EventCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "eventId", type: "uint256" },
      { indexed: true, internalType: "address", name: "participant", type: "address" },
      { indexed: false, internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "Registered",
    type: "event",
  },

  // -------- Read --------
  {
    inputs: [],
    name: "eventCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_eventId", type: "uint256" }],
    name: "getEventDetails",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "uint256", name: "fee", type: "uint256" },
          { internalType: "uint256", name: "maxParticipants", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "address", name: "organizer", type: "address" },
          { internalType: "bool", name: "isOpen", type: "bool" },
          { internalType: "uint256", name: "participantCount", type: "uint256" },
          { internalType: "bool", name: "fundsWithdrawn", type: "bool" },
        ],
        internalType: "struct ChainPass.Event",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_eventId", type: "uint256" },
      { internalType: "address", name: "_user", type: "address" },
    ],
    name: "isRegistered",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },

  // -------- Write --------
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "uint256", name: "_fee", type: "uint256" },
      { internalType: "uint256", name: "_maxParticipants", type: "uint256" },
      { internalType: "uint256", name: "_deadline", type: "uint256" },
    ],
    name: "createEvent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_eventId", type: "uint256" }],
    name: "registerForEvent",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_eventId", type: "uint256" }],
    name: "cancelRegistration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_eventId", type: "uint256" }],
    name: "withdrawFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const
