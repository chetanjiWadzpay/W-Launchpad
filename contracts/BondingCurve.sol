// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {WLaunchpadToken} from "./WLaunchpadToken.sol";
import {CurveMath} from "./libraries/CurveMath.sol";
import {FeeManager} from "./FeeManager.sol";

contract BondingCurve
{
    using CurveMath for uint;

    WLaunchpadToken public token;
    FeeManager public feeManager;
    address public creator;

    uint public totalSupply;

    uint public constant LIQUIDITY_THRESHOLD = 50 ether;

    bool public migrated;

    event Buy(
        address indexed buyer,
        uint amount,
        uint cost
    );

    event Sell(
        address indexed seller,
        uint amount,
        uint reward
    );

    event LiquidityThresholdReached(
        uint contractBalance
    );

    event FeePaid(
        address recipient,
        uint amount
    );

    constructor(
        address _token,
        address _creator,
        address _feeManager
    )
    {
        require(_token != address(0));
        require(_creator != address(0));
        require(_feeManager != address(0));

        token = WLaunchpadToken(_token);
        creator = _creator;
        feeManager = FeeManager(_feeManager);
    }

    // NEW FUNCTION (FIX)
    function getBuyCost(uint amount)
        external
        view
        returns(uint)
    {
        return CurveMath.calculatePrice(
            totalSupply,
            amount
        );
    }

    // NEW FUNCTION (FIX)
    function getSellReward(uint amount)
        external
        view
        returns(uint)
    {
        return CurveMath.calculateSellPrice(
            totalSupply,
            amount
        );
    }

    function buy(uint amount)
        external
        payable
    {
        require(!migrated, "Curve migrated");
        require(amount > 0, "Invalid amount");

        uint cost =
            CurveMath.calculatePrice(
                totalSupply,
                amount
            );

        require(
            msg.value >= cost,
            "Insufficient WCO"
        );

        (
            uint platformFee,
            uint creatorFee
        ) =
            feeManager.calculateFees(cost);

        _safeTransferWCO(
            feeManager.platform(),
            platformFee
        );

        emit FeePaid(
            feeManager.platform(),
            platformFee
        );

        _safeTransferWCO(
            creator,
            creatorFee
        );

        emit FeePaid(
            creator,
            creatorFee
        );

        totalSupply += amount;

        token.mint(
            msg.sender,
            amount
        );

        if(msg.value > cost)
        {
            uint refund =
                msg.value - cost;

            _safeTransferWCO(
                msg.sender,
                refund
            );
        }

        if(address(this).balance >= LIQUIDITY_THRESHOLD)
        {
            migrated = true;

            emit LiquidityThresholdReached(
                address(this).balance
            );
        }

        emit Buy(
            msg.sender,
            amount,
            cost
        );
    }

    function sell(uint amount)
        external
    {
        require(!migrated);
        require(amount > 0);

        uint reward =
            CurveMath.calculateSellPrice(
                totalSupply,
                amount
            );

        require(
            address(this).balance >= reward
        );

        totalSupply -= amount;

        token.burn(
            msg.sender,
            amount
        );

        _safeTransferWCO(
            msg.sender,
            reward
        );

        emit Sell(
            msg.sender,
            amount,
            reward
        );
    }

    function _safeTransferWCO(
        address to,
        uint amount
    )
        internal
    {
        if(amount == 0) return;

        (bool success,) =
            payable(to).call{value: amount}("");

        require(success);
    }

    function getCurrentPrice()
        external
        view
        returns(uint)
    {
        return CurveMath.calculatePrice(
            totalSupply,
            1
        );
    }

    receive() external payable {}
}
