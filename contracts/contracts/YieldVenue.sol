// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @notice Mock yield venue - deposits accrue a fixed APY in the same token.
///         Used to simulate Ondo USDY / mETH staking on testnet so agents have somewhere
///         to actually deploy capital during a duel.
contract YieldVenue {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;
    uint256 public immutable apyBps; // 1000 = 10% APY

    mapping(address => uint256) public principal;
    mapping(address => uint256) public lastUpdate;

    event Deposit(address indexed who, uint256 amount);
    event Withdraw(address indexed who, uint256 amount);

    constructor(IERC20 _asset, uint256 _apyBps) {
        asset = _asset;
        apyBps = _apyBps;
    }

    function accrued(address who) public view returns (uint256) {
        uint256 elapsed = block.timestamp - lastUpdate[who];
        if (principal[who] == 0 || elapsed == 0) return principal[who];
        // simple linear accrual: principal * apyBps * elapsed / (365 days * 10_000)
        uint256 yield = (principal[who] * apyBps * elapsed) / (365 days * 10_000);
        return principal[who] + yield;
    }

    function _settle(address who) internal {
        if (principal[who] > 0) {
            principal[who] = accrued(who);
        }
        lastUpdate[who] = block.timestamp;
    }

    function deposit(uint256 amount) external {
        _settle(msg.sender);
        asset.safeTransferFrom(msg.sender, address(this), amount);
        principal[msg.sender] += amount;
        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        _settle(msg.sender);
        require(amount <= principal[msg.sender], "insufficient");
        principal[msg.sender] -= amount;
        asset.safeTransfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount);
    }

    function balanceOf(address who) external view returns (uint256) {
        return accrued(who);
    }
}
