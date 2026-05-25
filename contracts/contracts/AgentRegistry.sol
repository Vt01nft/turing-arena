// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/// @title AgentRegistry - minimal ERC-8004-style identity + reputation registry.
/// @notice Tracks agent identities, on-chain reputation, and slashable MNT stakes.
/// @dev Inspired by ERC-8004 (Identity, Reputation, Validation registries).
contract AgentRegistry {
    struct Agent {
        address owner;
        string name;
        string metadataURI;
        uint96 stake;
        int256 reputation;
        uint32 totalDuels;
        uint32 wins;
        bool active;
    }

    uint256 public nextAgentId = 1;
    mapping(uint256 => Agent) public agents;
    mapping(address => uint256) public agentIdOf;

    uint96 public constant MIN_STAKE = 0.01 ether; // testnet demo; mainnet would be 100 MNT
    address public immutable duelHub;

    event AgentRegistered(uint256 indexed agentId, address indexed owner, string name);
    event StakeIncreased(uint256 indexed agentId, uint96 amount, uint96 newTotal);
    event ReputationChanged(uint256 indexed agentId, int256 delta, int256 newReputation);
    event DuelResult(uint256 indexed agentId, bool won);
    event Slashed(uint256 indexed agentId, uint96 amount);

    error InsufficientStake();
    error AlreadyRegistered();
    error NotOwner();
    error OnlyHub();
    error Unknown();

    modifier onlyHub() {
        if (msg.sender != duelHub) revert OnlyHub();
        _;
    }

    constructor(address _duelHub) {
        duelHub = _duelHub;
    }

    function register(string calldata name, string calldata metadataURI)
        external
        payable
        returns (uint256 id)
    {
        if (msg.value < MIN_STAKE) revert InsufficientStake();
        if (agentIdOf[msg.sender] != 0) revert AlreadyRegistered();

        id = nextAgentId++;
        agents[id] = Agent({
            owner: msg.sender,
            name: name,
            metadataURI: metadataURI,
            stake: uint96(msg.value),
            reputation: 0,
            totalDuels: 0,
            wins: 0,
            active: true
        });
        agentIdOf[msg.sender] = id;
        emit AgentRegistered(id, msg.sender, name);
    }

    function topUpStake(uint256 id) external payable {
        Agent storage a = agents[id];
        if (a.owner == address(0)) revert Unknown();
        a.stake += uint96(msg.value);
        emit StakeIncreased(id, uint96(msg.value), a.stake);
    }

    /// @notice Hub calls this on duel settlement to update reputation and tallies.
    function recordResult(uint256 id, bool won, int256 reputationDelta) external onlyHub {
        Agent storage a = agents[id];
        if (a.owner == address(0)) revert Unknown();
        a.totalDuels += 1;
        if (won) a.wins += 1;
        a.reputation += reputationDelta;
        emit ReputationChanged(id, reputationDelta, a.reputation);
        emit DuelResult(id, won);
    }

    /// @notice Hub may slash an agent's stake if it breaches duel rules (e.g. drawdown).
    function slash(uint256 id, uint96 amount, address to) external onlyHub {
        Agent storage a = agents[id];
        if (a.owner == address(0)) revert Unknown();
        if (amount > a.stake) amount = a.stake;
        a.stake -= amount;
        emit Slashed(id, amount);
        if (amount > 0) {
            (bool ok, ) = to.call{value: amount}("");
            require(ok, "transfer failed");
        }
    }

    function getAgent(uint256 id) external view returns (Agent memory) {
        return agents[id];
    }
}
