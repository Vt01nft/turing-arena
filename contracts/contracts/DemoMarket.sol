// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title DemoMarket — parimutuel binary outcome market for a single duel
/// @notice Standalone (no Duel coupling) so we can demo the full bet flow
///         end-to-end on testnet. Production version is DuelMarket.sol which
///         settles automatically from on-chain Duel scores.
contract DemoMarket {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    address public immutable owner;
    uint256 public immutable endsAt;
    string public agentAName;
    string public agentBName;

    uint256 public poolA;
    uint256 public poolB;
    mapping(address => uint256) public sharesA;
    mapping(address => uint256) public sharesB;

    bool public resolved;
    uint8 public winningSide; // 1 = A, 2 = B

    event Stake(address indexed who, uint8 side, uint256 amount);
    event Resolve(uint8 winningSide);
    event Claim(address indexed who, uint256 payout);

    error MarketClosed();
    error InvalidSide();
    error NotResolved();
    error AlreadyResolved();
    error NotOwner();
    error NothingToClaim();

    constructor(IERC20 _usdc, uint256 _endsAt, string memory _a, string memory _b) {
        usdc = _usdc;
        owner = msg.sender;
        endsAt = _endsAt;
        agentAName = _a;
        agentBName = _b;
    }

    function isOpen() public view returns (bool) {
        return !resolved && block.timestamp < endsAt;
    }

    function stake(uint8 side, uint256 amount) external {
        if (!isOpen()) revert MarketClosed();
        if (side != 1 && side != 2) revert InvalidSide();
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        if (side == 1) {
            poolA += amount;
            sharesA[msg.sender] += amount;
        } else {
            poolB += amount;
            sharesB[msg.sender] += amount;
        }
        emit Stake(msg.sender, side, amount);
    }

    /// @notice Owner-only resolution for the demo. Production would derive
    ///         winner from on-chain Duel.scoreA/scoreB.
    function resolve(uint8 _winner) external {
        if (msg.sender != owner) revert NotOwner();
        if (resolved) revert AlreadyResolved();
        if (_winner != 1 && _winner != 2) revert InvalidSide();
        resolved = true;
        winningSide = _winner;
        emit Resolve(_winner);
    }

    function claim() external {
        if (!resolved) revert NotResolved();
        uint256 mine = winningSide == 1 ? sharesA[msg.sender] : sharesB[msg.sender];
        if (mine == 0) revert NothingToClaim();
        uint256 winnerPool = winningSide == 1 ? poolA : poolB;
        uint256 total = poolA + poolB;
        uint256 payout = (mine * total) / winnerPool;
        if (winningSide == 1) sharesA[msg.sender] = 0;
        else sharesB[msg.sender] = 0;
        usdc.safeTransfer(msg.sender, payout);
        emit Claim(msg.sender, payout);
    }

    /// @return bps Probability of A winning in basis points (5000 = 50%)
    function priceA() external view returns (uint256 bps) {
        uint256 t = poolA + poolB;
        if (t == 0) return 5000;
        return (poolA * 10_000) / t;
    }

    function totalVolume() external view returns (uint256) {
        return poolA + poolB;
    }
}
