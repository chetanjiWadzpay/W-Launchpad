// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

library CurveMath
{
    uint constant BASE_PRICE = 1e14; // 0.0001 WCO
    uint constant SLOPE = 1e10;

    function calculatePrice(
        uint supply,
        uint amount
    )
        internal
        pure
        returns(uint)
    {
        uint total;

        for(uint i = 0; i < amount; i++)
        {
            total += BASE_PRICE + ((supply + i) * SLOPE);
        }

        return total;
    }

    function calculateSellPrice(
        uint supply,
        uint amount
    )
        internal
        pure
        returns(uint)
    {
        uint total;

        for(uint i = 0; i < amount; i++)
        {
            total += BASE_PRICE + ((supply - i) * SLOPE);
        }

        return total;
    }
}
