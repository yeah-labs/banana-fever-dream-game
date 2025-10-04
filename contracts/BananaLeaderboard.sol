// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BananaLeaderboard
 * @dev Simple leaderboard contract for Banana Fever Dream game
 * Stores best scores for each player address with basic validation
 */
contract BananaLeaderboard {
    // Struct to store player score data (extensible for future additions)
    struct ScoreEntry {
        address player;
        uint256 score;
        uint256 timestamp;
        bool exists;
    }
    
    // Mapping from address to their best score
    mapping(address => ScoreEntry) public scores;
    
    // Array to track all players (for fetching leaderboard data)
    address[] public players;
    
    // Events
    event ScoreSubmitted(address indexed player, uint256 score, uint256 timestamp);
    event NewHighScore(address indexed player, uint256 oldScore, uint256 newScore);
    
    /**
     * @dev Submit a score to the leaderboard
     * @param _score The score to submit
     * Requirements:
     * - Score must be greater than 0
     * - Score must be better than player's current best score
     */
    function submitScore(uint256 _score) external {
        require(_score > 0, "Score must be greater than 0");
        
        ScoreEntry storage entry = scores[msg.sender];
        
        if (!entry.exists) {
            // First time player
            scores[msg.sender] = ScoreEntry({
                player: msg.sender,
                score: _score,
                timestamp: block.timestamp,
                exists: true
            });
            players.push(msg.sender);
            emit ScoreSubmitted(msg.sender, _score, block.timestamp);
        } else {
            // Existing player - only update if new score is higher
            require(_score > entry.score, "New score must be higher than current best");
            
            uint256 oldScore = entry.score;
            entry.score = _score;
            entry.timestamp = block.timestamp;
            
            emit NewHighScore(msg.sender, oldScore, _score);
            emit ScoreSubmitted(msg.sender, _score, block.timestamp);
        }
    }
    
    /**
     * @dev Get a player's best score
     * @param _player Address of the player
     * @return score The player's best score (0 if never played)
     * @return timestamp When the score was achieved
     */
    function getPlayerScore(address _player) external view returns (uint256 score, uint256 timestamp) {
        ScoreEntry memory entry = scores[_player];
        return (entry.score, entry.timestamp);
    }
    
    /**
     * @dev Get all player addresses (for off-chain sorting)
     * @return Array of all player addresses who have submitted scores
     */
    function getAllPlayers() external view returns (address[] memory) {
        return players;
    }
    
    /**
     * @dev Get all scores (for off-chain sorting and display)
     * @return _players Array of player addresses
     * @return _scores Array of corresponding scores
     * @return _timestamps Array of corresponding timestamps
     */
    function getAllScores() external view returns (
        address[] memory _players,
        uint256[] memory _scores,
        uint256[] memory _timestamps
    ) {
        uint256 playerCount = players.length;
        _players = new address[](playerCount);
        _scores = new uint256[](playerCount);
        _timestamps = new uint256[](playerCount);
        
        for (uint256 i = 0; i < playerCount; i++) {
            address player = players[i];
            ScoreEntry memory entry = scores[player];
            _players[i] = player;
            _scores[i] = entry.score;
            _timestamps[i] = entry.timestamp;
        }
        
        return (_players, _scores, _timestamps);
    }
    
    /**
     * @dev Get total number of players
     * @return Total number of unique players who have submitted scores
     */
    function getPlayerCount() external view returns (uint256) {
        return players.length;
    }
}
