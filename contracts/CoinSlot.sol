// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CoinSlot
 * @dev Simple payment contract for Banana Fever Dream game
 * Players pay 0.1 APE to play in competitive mode and rank on the leaderboard
 */
contract CoinSlot {
    // Owner of the contract (can withdraw funds)
    address public owner;
    
    // Cost to play: 0.1 APE
    uint256 public constant PLAY_COST = 0.1 ether;
    
    // Track which players have paid for current session
    mapping(address => bool) public hasActivePay;
    
    // Track total payments received
    uint256 public totalPayments;
    
    // Events
    event GamePaid(address indexed player, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed owner, uint256 amount, uint256 timestamp);
    event PaymentCleared(address indexed player, uint256 timestamp);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Pay to play the game in competitive mode
     * Players must send exactly 0.1 APE
     */
    function playGame() external payable {
        require(msg.value == PLAY_COST, "Must pay exactly 0.1 APE to play");
        
        // Mark player as having paid
        hasActivePay[msg.sender] = true;
        totalPayments += msg.value;
        
        emit GamePaid(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Clear payment status for a player after they finish their game
     * Can be called by anyone, but typically called by the player or leaderboard contract
     * @param _player Address of the player to clear
     */
    function clearPayment(address _player) external {
        hasActivePay[_player] = false;
        emit PaymentCleared(_player, block.timestamp);
    }
    
    /**
     * @dev Check if a player has an active payment
     * @param _player Address of the player to check
     * @return bool True if player has paid and not yet used their credit
     */
    function hasActivePayment(address _player) external view returns (bool) {
        return hasActivePay[_player];
    }
    
    /**
     * @dev Get the contract balance
     * @return uint256 Current balance in wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Owner can withdraw accumulated funds
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawal(owner, balance, block.timestamp);
    }
    
    /**
     * @dev Transfer ownership to a new address
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}

