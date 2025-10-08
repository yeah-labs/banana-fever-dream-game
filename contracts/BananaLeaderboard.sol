// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BananaLeaderboard
 * @dev Simple leaderboard contract for Banana Fever Dream game
 * Stores all scores for each player address with basic validation
 */
contract BananaLeaderboard {
    // Struct to store player score data
    struct ScoreEntry {
        address player;
        address originalWallet;
        uint256 score;
        uint256 timestamp;
        uint256 entryId;
    }
    
    // Array to store all score entries
    ScoreEntry[] public allScores;
    
    // Counter for unique entry IDs
    uint256 private nextEntryId;
    
    // Events
    event ScoreSubmitted(address indexed player, address indexed originalWallet, uint256 score, uint256 timestamp, uint256 entryId);
    
    /**
     * @dev Submit a score to the leaderboard
     * @param _score The score to submit
     * @param _originalWallet The original wallet address (EOA)
     * Requirements:
     * - Score must be greater than 0
     * - Original wallet address must not be zero address
     */
    function submitScore(uint256 _score, address _originalWallet) external {
        require(_score > 0, "Score must be greater than 0");
        require(_originalWallet != address(0), "Original wallet cannot be zero address");
        
        // Create new score entry
        ScoreEntry memory newEntry = ScoreEntry({
            player: msg.sender,
            originalWallet: _originalWallet,
            score: _score,
            timestamp: block.timestamp,
            entryId: nextEntryId
        });
        
        allScores.push(newEntry);
        emit ScoreSubmitted(msg.sender, _originalWallet, _score, block.timestamp, nextEntryId);
        
        nextEntryId++;
    }
    
    /**
     * @dev Get a player's scores
     * @param _player Address of the player
     * @return _scores Array of all scores for this player
     * @return _timestamps Array of corresponding timestamps
     * @return _entryIds Array of corresponding entry IDs
     * @return _originalWallets Array of corresponding original wallet addresses
     */
    function getPlayerScores(address _player) external view returns (
        uint256[] memory _scores,
        uint256[] memory _timestamps,
        uint256[] memory _entryIds,
        address[] memory _originalWallets
    ) {
        // First, count how many scores the player has
        uint256 count = 0;
        for (uint256 i = 0; i < allScores.length; i++) {
            if (allScores[i].player == _player) {
                count++;
            }
        }
        
        // Initialize arrays
        _scores = new uint256[](count);
        _timestamps = new uint256[](count);
        _entryIds = new uint256[](count);
        _originalWallets = new address[](count);
        
        // Fill arrays
        uint256 index = 0;
        for (uint256 i = 0; i < allScores.length; i++) {
            if (allScores[i].player == _player) {
                _scores[index] = allScores[i].score;
                _timestamps[index] = allScores[i].timestamp;
                _entryIds[index] = allScores[i].entryId;
                _originalWallets[index] = allScores[i].originalWallet;
                index++;
            }
        }
        
        return (_scores, _timestamps, _entryIds, _originalWallets);
    }
    
    /**
     * @dev Get all scores (for off-chain sorting and display)
     * @return _players Array of player addresses
     * @return _originalWallets Array of original wallet addresses
     * @return _scores Array of corresponding scores
     * @return _timestamps Array of corresponding timestamps
     */
    function getAllScores() external view returns (
        address[] memory _players,
        address[] memory _originalWallets,
        uint256[] memory _scores,
        uint256[] memory _timestamps
    ) {
        uint256 totalCount = allScores.length;
        _players = new address[](totalCount);
        _originalWallets = new address[](totalCount);
        _scores = new uint256[](totalCount);
        _timestamps = new uint256[](totalCount);
        
        for (uint256 i = 0; i < totalCount; i++) {
            _players[i] = allScores[i].player;
            _originalWallets[i] = allScores[i].originalWallet;
            _scores[i] = allScores[i].score;
            _timestamps[i] = allScores[i].timestamp;
        }
        
        return (_players, _originalWallets, _scores, _timestamps);
    }
    
    /**
     * @dev Get total number of score entries
     * @return Total number of score entries submitted
     */
    function getTotalScores() external view returns (uint256) {
        return allScores.length;
    }
    
    /**
     * @dev Get score entry by index
     * @param _index Index of the score entry
     * @return player Address of the player
     * @return originalWallet Address of the original wallet
     * @return score The score value
     * @return timestamp When the score was submitted
     * @return entryId Unique entry ID
     */
    function getScoreByIndex(uint256 _index) external view returns (
        address player,
        address originalWallet,
        uint256 score,
        uint256 timestamp,
        uint256 entryId
    ) {
        require(_index < allScores.length, "Index out of bounds");
        ScoreEntry memory entry = allScores[_index];
        return (entry.player, entry.originalWallet, entry.score, entry.timestamp, entry.entryId);
    }
}
