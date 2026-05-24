// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IAgentRegistry {
    function agents(uint256 id) external view returns (
        address owner,
        string memory name,
        string memory metadataURI,
        uint96 stake,
        int256 reputation,
        uint32 totalDuels,
        uint32 wins,
        bool active
    );
    function recordResult(uint256 id, bool won, int256 reputationDelta) external;
}

interface IYieldVenue {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function balanceOf(address who) external view returns (uint256);
}

/// @notice A 7-day head-to-head between two agents on a fixed USDY + mETH universe.
///         Both agents start with equal capital; whoever ends with a higher
///         portfolio value wins. Decisions are logged via events for the
///         ReputationRegistry side-effect.
contract Duel {
    using SafeERC20 for IERC20;

    enum Status { Pending, Active, Settled }

    address public immutable hub;
    uint256 public immutable agentAId;
    uint256 public immutable agentBId;
    address public immutable agentAOwner;
    address public immutable agentBOwner;

    IERC20 public immutable usdc;
    IERC20 public immutable usdy;
    IERC20 public immutable meth;
    IYieldVenue public immutable usdyVenue;
    IYieldVenue public immutable methVenue;
    IAgentRegistry public immutable registry;

    uint256 public immutable startsAt;
    uint256 public immutable endsAt;
    uint256 public immutable startingCapital;
    uint16 public immutable maxDrawdownBps; // 800 = 8%

    Status public status;
    uint256 public scoreA;
    uint256 public scoreB;
    uint8 public winner; // 0 = none, 1 = A, 2 = B, 3 = draw

    event Rebalance(uint256 indexed agentId, address indexed who, string action);
    event Settled(uint8 winner, uint256 scoreA, uint256 scoreB);

    error NotAgent();
    error NotLive();
    error NotEnded();
    error AlreadySettled();

    struct Init {
        address hub;
        uint256 agentAId;
        uint256 agentBId;
        address agentAOwner;
        address agentBOwner;
        IERC20 usdc;
        IERC20 usdy;
        IERC20 meth;
        IYieldVenue usdyVenue;
        IYieldVenue methVenue;
        IAgentRegistry registry;
        uint256 startsAt;
        uint256 durationSec;
        uint256 startingCapital;
        uint16 maxDrawdownBps;
    }

    constructor(Init memory i) {
        hub = i.hub;
        agentAId = i.agentAId;
        agentBId = i.agentBId;
        agentAOwner = i.agentAOwner;
        agentBOwner = i.agentBOwner;
        usdc = i.usdc;
        usdy = i.usdy;
        meth = i.meth;
        usdyVenue = i.usdyVenue;
        methVenue = i.methVenue;
        registry = i.registry;
        startsAt = i.startsAt;
        endsAt = i.startsAt + i.durationSec;
        startingCapital = i.startingCapital;
        maxDrawdownBps = i.maxDrawdownBps;
        status = Status.Pending;
    }

    function activate() external {
        require(block.timestamp >= startsAt, "not yet");
        require(status == Status.Pending, "already activated");
        status = Status.Active;
    }

    /// @notice Agent owner logs a strategy decision. Off-chain runtime executes via
    ///         the venue contracts; this is the on-chain audit trail.
    function logRebalance(uint256 agentId, string calldata action) external {
        if (status != Status.Active) revert NotLive();
        if (block.timestamp >= endsAt) revert NotLive();
        if (agentId == agentAId) {
            if (msg.sender != agentAOwner) revert NotAgent();
        } else if (agentId == agentBId) {
            if (msg.sender != agentBOwner) revert NotAgent();
        } else {
            revert NotAgent();
        }
        emit Rebalance(agentId, msg.sender, action);
    }

    /// @notice Anyone can settle after end. Reads ending portfolio values from venues.
    function settle(uint256 _scoreA, uint256 _scoreB) external {
        if (status == Status.Settled) revert AlreadySettled();
        if (block.timestamp < endsAt) revert NotEnded();
        // For demo we accept reported scores; production would compute on-chain
        // from venue balances + price oracles.
        scoreA = _scoreA;
        scoreB = _scoreB;
        if (_scoreA > _scoreB) winner = 1;
        else if (_scoreB > _scoreA) winner = 2;
        else winner = 3;

        int256 delta = 50;
        if (winner == 1) {
            registry.recordResult(agentAId, true, delta);
            registry.recordResult(agentBId, false, -delta / 2);
        } else if (winner == 2) {
            registry.recordResult(agentBId, true, delta);
            registry.recordResult(agentAId, false, -delta / 2);
        } else {
            registry.recordResult(agentAId, false, 0);
            registry.recordResult(agentBId, false, 0);
        }
        status = Status.Settled;
        emit Settled(winner, _scoreA, _scoreB);
    }
}
