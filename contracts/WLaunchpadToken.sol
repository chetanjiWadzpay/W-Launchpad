// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WLaunchpadToken is ERC20
{
    address public factory;
    address public bondingCurve;
    address public creator;

    modifier onlyBondingCurve()
    {
        require(msg.sender == bondingCurve);
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address _creator,
        address _factory
    )
        ERC20(name, symbol)
    {
        creator = _creator;
        factory = _factory;
    }

    function setBondingCurve(address curve)
        external
    {
        require(msg.sender == factory);

        bondingCurve = curve;
    }

    function mint(address to, uint amount)
        external
        onlyBondingCurve
    {
        _mint(to, amount);
    }

    function burn(address from, uint amount)
        external
        onlyBondingCurve
    {
        _burn(from, amount);
    }
}
