// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ChainPass
 * @notice On-chain event registration with NFT tickets
 */
contract ChainPass is ERC1155, ReentrancyGuard {

    // ============ Custom Errors ============
    
    error InvalidMaxParticipants();
    error DeadlineMustBeFuture();
    error EventDoesNotExist();
    error OnlyOrganizer();
    error RegistrationClosed();
    error RegistrationEnded();
    error EventFull();
    error IncorrectFee();
    error AlreadyRegistered();
    error NotRegistered();
    error CannotCancelAfterDeadline();
    error RefundFailed();
    error RegistrationAlreadyOpen();
    error RegistrationAlreadyClosed();
    error EventNotEnded();
    error NoFundsToWithdraw();
    error WithdrawalFailed();
    
    // ============ Modifiers ============
    
    modifier onlyOrganizer(uint256 _eventId) {
        if (msg.sender != events[_eventId].organizer) revert OnlyOrganizer();
        _;
    }
    
    modifier eventExists(uint256 _eventId) {
        if (events[_eventId].organizer == address(0)) revert EventDoesNotExist();
        _;
    }

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
     uint256 public eventCounter;
     mapping(uint256 => Event) public events;
     mapping(uint256 => address[]) public eventParticipants;
     mapping(uint256 => mapping(address => bool)) public hasRegistered;

      // ============ Events ============  //
      event EventCreated(
          uint256 indexed eventId,
          string name,
          address indexed organizer,
          uint256 fee,
          uint256 maxParticipants,
          uint256 deadline   
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

   // ============ Internal Validators ============
    
    /**
     * @notice Validate registration eligibility
     */
    function _validateRegistration(uint256 _eventId, address _user) internal view {
        Event storage evt = events[_eventId];
        
        if (!evt.isOpen) revert RegistrationClosed();
        if (block.timestamp >= evt.deadline) revert RegistrationEnded();
        if (evt.participantCount >= evt.maxParticipants) revert EventFull();
        if (hasRegistered[_eventId][_user]) revert AlreadyRegistered();
    }
    
    /**
     * @notice Validate cancellation eligibility
     */
    function _validateCancellation(uint256 _eventId, address _user) internal view {
        Event storage evt = events[_eventId];
        
        if (!hasRegistered[_eventId][_user]) revert NotRegistered();
        if (block.timestamp >= evt.deadline) revert CannotCancelAfterDeadline();
        if (!evt.isOpen) revert RegistrationClosed();
    }
    
    /**
     * @notice Validate withdrawal eligibility
     */
    function _validateWithdrawal(uint256 _eventId) internal view {
        Event storage evt = events[_eventId];
        
        if (block.timestamp < evt.deadline) revert EventNotEnded();
        
        uint256 amount = evt.fee * evt.participantCount;
        if (amount == 0) revert NoFundsToWithdraw();
    }

       // ============ Organizer Functions ============
    /**
     * @notice Create a new event
     */
    function createEvent(
        string memory _name,
        uint256 _fee,
        uint256 _maxParticipants,
        uint256 _deadline
    ) external {
        if(_maxParticipants == 0) revert InvalidMaxParticipants();
        if(_deadline <= block.timestamp) revert DeadlineMustBeFuture(); 

        eventCounter++;
        uint256 eventId = eventCounter;

        events[eventId] = Event({
            name: _name,
            fee: _fee,
            maxParticipants: _maxParticipants,
            deadline: _deadline,
            organizer: msg.sender,
            isOpen: false,
            participantCount: 0
        });

        emit  EventCreated(eventId, _name, msg.sender, _fee, _maxParticipants, _deadline);
    }
    /**
     * @notice Open registration for an event
     */
    function openRegistration(uint256 _eventId) external onlyOrganizer(_eventId)  {
        Event storage evt = events[_eventId];
        if (evt.isOpen) revert RegistrationAlreadyOpen();
        
        evt.isOpen = true;
        emit RegistrationToggled(_eventId, true);
    }

       /**
     * @notice Pause registration for an event (temporary)
     */
    function pauseRegistration(uint256 _eventId) external onlyOrganizer(_eventId) {
        Event storage evt = events[_eventId];
        if (!evt.isOpen) revert RegistrationAlreadyClosed();
        
        evt.isOpen = false;
        emit RegistrationToggled(_eventId, false);
    }

     /**
     * @notice Reopen registration for an event (after pause)
     */
    function reopenRegistration(uint256 _eventId) external onlyOrganizer(_eventId) {
        Event storage evt = events[_eventId];
        if (evt.isOpen) revert RegistrationAlreadyOpen();
        
        evt.isOpen = true;
        emit RegistrationToggled(_eventId, true);
    }
    
    /**
     * @notice Close registration for an event
     */
    function closeRegistration(uint256 _eventId) external onlyOrganizer(_eventId) {
        Event storage evt = events[_eventId];
        if(!evt.isOpen) revert RegistrationAlreadyClosed();
        
        evt.isOpen = false;
        emit RegistrationToggled(_eventId, false);
    }

    // ============ User Functions ============

      /** 
     * @notice Register for an event and receive NFT ticket
     */
    function registerForEvent(uint256 _eventId) external payable nonReentrant eventExists(_eventId) {
        if (msg.value != events[_eventId].fee) revert IncorrectFee();

        _validateRegistration(_eventId, msg.sender);
       
        Event storage evt = events[_eventId];

       // Update state
        hasRegistered[_eventId][msg.sender] = true;
        eventParticipants[_eventId].push(msg.sender);
        evt.participantCount++;

        require(
            !hasRegistered[_eventId][msg.sender], "Already registered for this event");
        require(msg.value == evt.fee, "Incorrect fee");

       // Mint NFT ticket (tokenId = eventId)
        _mint(msg.sender, _eventId, 1, "");
        
        emit Registered(_eventId, msg.sender, _eventId);
        emit TicketMinted(_eventId, msg.sender);
    }

      /**
     * @notice Cancel registration and get refund
     */
    function cancelRegistration(uint256 _eventId) external nonReentrant {
        _validateCancellation(_eventId, msg.sender);

        Event storage evt = events[_eventId];

        // Update state
        hasRegistered[_eventId][msg.sender] = false;
        evt.participantCount--;

        // Remove from participants array
        address[] storage participants = eventParticipants[_eventId];
        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i] == msg.sender) {
                participants[i] = participants[participants.length - 1];
                participants.pop();
                break;
            }
        }

        //Burn NFT Ticket
        _burn(msg.sender, _eventId, 1);

         // Refund
        uint256 refundAmount = evt.fee;
        (bool success, ) = msg.sender.call{value: refundAmount}("");
        if (!success) revert RefundFailed();
        
        emit RegistrationCancelled(_eventId, msg.sender, refundAmount);
    }

        // ============ View Functions ============
    
    /**
     * @notice Get all participants for an event
     */
    function getParticipants(uint256 _eventId) external view returns(address[] memory) {
        return eventParticipants[_eventId];
    }

    /**
     * @notice Get event details
     */
    function getEventDetails(uint256 _eventId) external view returns (Event memory) {
        return events[_eventId];
    }

      /**
     * @notice Get token URI for NFT metadata
     * @dev Returns: baseURI + tokenId + .json
     */
    function uri(uint256 _tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(super.uri(_tokenId), Strings.toString(_tokenId), ".json"));
    }

  // ============ Organizer Withdrawal of Event funds ============
    
    /**
     * @notice Organizer withdraws event funds after deadline
     */
    function withdrawFunds(uint256 _eventId) external nonReentrant onlyOrganizer(_eventId) {
        _validateWithdrawal(_eventId);
        
        Event storage evt = events[_eventId];
        uint256 amount = evt.fee * evt.participantCount;
        
        // Prevent double withdrawal
        evt.participantCount = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert WithdrawalFailed();
    }
}