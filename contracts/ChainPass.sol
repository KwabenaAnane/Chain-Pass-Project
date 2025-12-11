// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ChainPass
 * @notice On-chain event registration with NFT tickets
 */

contract ChainPass is ERC!!%%, ReentrancyGuard {

    // ============ Structs ===========

    struct Event {
        string name;
        uint256 fee;
        uint256 maxParticipants;
        uint256 deadline;
        address organizer;
        bool isOpen;
        uint256 participantCount;
    }

     // ============ State Variables ============

     uint256 eventCounter;
     mapping(uint256 => Event) public events;
     mapping(uint256 => address[]) public eventParticipants;
     mapping(uint256 => mapping(address => bool)) public hasRegistered;

      // ============ Events ============
      event EventCreated(
          uint256 indexed eventId,
          string name,
          address indexed organizer,
          uint256 fee,
          uint256 maxParticipants,
          uint256 deadline,
        
      );

      event Registered(
          uint256 indexed eventId,
          address indexed participant,
          uint256 tokenId
      );

      event TicketMinted(
        uint256 indexed tokenId,
        address indexed owner      
      );

      event RegistrationCancelled(
        uint256 indexed eventId,
        address indexed participant,
        uint refundAmount
      );

      event RegistrationToggled(
        uint256 indexed eventId,
        bool isOpen
      );

       // ============ Constructor ============
       constructor() ERC1155(""){
        // Base URI will be set after deployment or hardcoded here
        // Example: ERC1155("ipfs://YOUR_FOLDER_CID/")

       }

    /**
     * @notice Set base URI (only call once after uploading to IPFS)
     */
    function setURI(string memory newuri) external {
        _setURI(newuri);
    }

       // ============ Organizer Functions ============
    
    /**
     * @notice Create a new event
     */

    function createEvent(
        string memory _name,
        uint256 _fee,
        uint256 _maxParticipants,
        uint256 _deadline,
        address _organizer
    ) external {
        require(_maxParticipants > 0, "Max participants must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        eventCounter++;
        uint256 eventId = eventCounter;

        events[eventId] = Event({
            name: _name,
            fee: _fee,
            maxParticipants: _maxParticipants,
            deadline: _deadline,
            organizer: msg.sender,
            isOpen: true,
            participantCount: 0
        });

        emit  EventCreated(eventId, _name, msg.sender, _fee, _maxParticipants, _deadline);

     /**
     * @notice Open registration for an event
     */
    function openRegistration(uint256 _eventId) external {
        Event storage evt = events[_eventId];
        require(msg.sender == evt.organizer, "Only organizer");
        require(!evt.isOpen, "Registration already open");
        
        evt.isOpen = true;
        emit RegistrationToggled(_eventId, true);
    }
    
    /**
     * @notice Close registration for an event
     */
    function closeRegistration(uint256 _eventId) external {
        Event storage evt = events[_eventId];
        require(msg.sender == evt.organizer, "Only organizer");
        require(evt.isOpen, "Registration already closed");
        
        evt.isOpen = false;
        emit RegistrationToggled(_eventId, false);
    }

    }
    














}