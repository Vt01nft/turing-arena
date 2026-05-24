// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Faucet-able ERC20 for testnet (USDC, USDY, mETH stand-ins).
contract MockERC20 is ERC20, Ownable {
    uint8 private immutable _decimals;
    uint256 public faucetAmount;

    constructor(string memory name_, string memory symbol_, uint8 dec, uint256 faucet_)
        ERC20(name_, symbol_)
        Ownable(msg.sender)
    {
        _decimals = dec;
        faucetAmount = faucet_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Anyone can claim a small amount for testnet testing.
    function drip() external {
        _mint(msg.sender, faucetAmount);
    }

    function setFaucetAmount(uint256 amount) external onlyOwner {
        faucetAmount = amount;
    }
}
