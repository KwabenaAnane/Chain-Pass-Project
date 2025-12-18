export const CHAINPASS_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [],
    name: "AlreadyRegistered",
    type: "error"
  },
  {
    inputs: [],
    name: "CannotCancelAfterDeadline",
    type: "error"
  },
  {
    inputs: [],
    name: "DeadlineMustBeFuture",
    type: "error"
  },
  {
    inputs: [],
    name: "EventDoesNotExist",
    type: "error"
  },
  {
    inputs: [],
    name: "EventFull",
    type: "error"
  },
  {
    inputs: [],
    name: "EventNotEnded",
    type: "error"
  },
  {
    inputs: [],
    name: "FundsAlreadyWithdrawn",
    type: "error"
  },
  {
    inputs: [],
    name: "IncorrectFee",
    type: "error"
  },
  {
    inputs: [],
    name: "InvalidMaxParticipants",
    type: "error"
  },
  {
    inputs: [],
    name: "NoFundsToWithdraw",
    type: "error"
  },
  {
    inputs: [],
    name: "NotRegistered",
    type: "error"
  },
  {
    inputs: [],
    name: "OnlyOrganizer",
    type: "error"
  },
  {
    inputs: [],
    name: "RefundFailed",
    type: "error"
  },
  {
    inputs: [],
    name: "RegistrationAlreadyClosed",
    type: "error"
  },
  {
    inputs: [],
    name: "RegistrationAlreadyOpen",
    type: "error"
  },
  {
    inputs: [],
    name: "RegistrationClosed",
    type: "error"
  },
  {
    inputs: [],
    name: "RegistrationEnded",
    type: "error"
  },
  {
    inputs: [],
    name: "WithdrawalFailed",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "eventId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string"
      },
      {
        indexed: true,
        internalType: "address",
        name: "organizer",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxParticipants",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "EventCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "eventId",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "organizer",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "FundsWithdrawn",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "eventId",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "participant",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256"
      }
    ],
    name: "Registered",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "eventId",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "participant",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "refundAmount",
        type: "uint256"
      }
    ],
    name: "RegistrationCancelled",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "eventId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isOpen",
        type: "bool"
      }
    ],
    name: "RegistrationToggled",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    name: "TicketMinted",
    type: "event"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_eventId",
        type: "uint256"
      }
    ],
    name: "cancelRegistration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_eventId",
        type: "uint256"
      }
    ],
    name: "closeRegistration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "_fee",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_maxParticipants",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_deadline",
        type: "uint256"
      }
    ],
    name: "createEvent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "eventCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "eventParticipants",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "events",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "maxParticipants",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "organizer",
        type: "address"
      },
      {
        internalType: "bool",
        name: "isOpen",
        type: "bool"
      },
      {
        internalType: "uint256",
        name: "participantCount",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "fundsWithdrawn",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_eventId",
        type: "uint256"
      }
    ],
    name: "getEventDetails",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string"
          },
          {
            internalType: "uint256",
            name: "fee",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "maxParticipants",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "organizer",
            type: "address"
          },
          {
            internalType: "bool",
            name: "isOpen",
            type: "bool"
          },
          {
            internalType: "uint256",
            name: "participantCount",
            type: "uint256"
          },
          {
            internalType: "bool",
            name: "fundsWithdrawn",
            type: "bool"
          }
        ],
        internalType: "struct ChainPass.Event",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_eventId",
        type: "uint256"
      }
    ],
    name: "getParticipants",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "hasRegistered",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_eventId",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_user",
        type: "address"
      }
    ],
    name: "isRegistered",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_eventId",
        type: "uint256"
      }
    ],
    name: "openRegistration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_eventId",
        type: "uint256"
      }
    ],
    name: "pauseRegistration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_eventId",
        type: "uint256"
      }
    ],
    name: "registerForEvent",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_eventId",
        type: "uint256"
      }
    ],
    name: "reopenRegistration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "newuri",
        type: "string"
      }
    ],
    name: "setURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256"
      }
    ],
    name: "uri",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_eventId",
        type: "uint256"
      }
    ],
    name: "withdrawFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;