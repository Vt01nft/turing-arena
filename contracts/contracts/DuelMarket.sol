// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IDuel {
    function status() external view returns (uint8);
    function winner() external view returns (uint8);
    function endsAt() external view returns (uint256);
}

/// @notice Binary outcome market for a single duel: "A wins" vs "B wins".
///         Uses a simple fixed-price share model (price moves with order book imbalance).
///         For hackathon simplicity, this is a parimutuel pool - fairness via pro-rata payout.
contract DuelMarket {
    using SafeERC20 for IERC20;

    IDuel public immutable duel;
    IERC20 public immutable usdc;

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
    error NotResolved();
    error AlreadyResolved();
    error InvalidSide();
    error NothingToClaim();

    constructor(IDuel _duel, IERC20 _usdc) {
        duel = _duel;
        usdc = _usdc;
    }

    function isOpen() public view returns (bool) {
        return duel.status() != 2 /* Settled */ && block.timestamp < duel.endsAt();
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

    function resolve() external {
        if (resolved) revert AlreadyResolved();
        require(duel.status() == 2, "duel not settled");
        uint8 w = duel.winner();
        require(w == 1 || w == 2, "no winner");
        winningSide = w;
        resolved = true;
        emit Resolve(w);
    }

    function claim() external {
        if (!resolved) revert NotResolved();
        uint256 myShares = winningSide == 1 ? sharesA[msg.sender] : sharesB[msg.sender];
        if (myShares == 0) revert NothingToClaim();

        uint256 winnerPool = winningSide == 1 ? poolA : poolB;
        uint256 loserPool = winningSide == 1 ? poolB : poolA;
        uint256 totalPool = winnerPool + loserPool;
        uint256 payout = (myShares * totalPool) / winnerPool;

        if (winningSide == 1) sharesA[msg.sender] = 0;
        else sharesB[msg.sender] = 0;

        usdc.safeTransfer(msg.sender, payout);
        emit Claim(msg.sender, payout);
    }

    function priceA() external view returns (uint256 bps) {
        uint256 t = poolA + poolB;
        if (t == 0) return 5000;
        return (poolA * 10_000) / t;
    }
}
