// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract FeeManager
{
    address public platform;

    uint public constant PLATFORM_FEE = 200; // 2%
    uint public constant CREATOR_FEE = 200; // 2%

    uint constant DENOM = 10000;

    constructor(address _platform)
    {
        platform = _platform;
    }

    function calculateFees(uint amount)
        external
        pure
        returns(
            uint platformFee,
            uint creatorFee
        )
    {
        platformFee = (amount * PLATFORM_FEE) / DENOM;
        creatorFee = (amount * CREATOR_FEE) / DENOM;
    }
}
