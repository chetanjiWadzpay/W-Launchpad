// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {WLaunchpadToken} from "./WLaunchpadToken.sol";
import {CurveMath} from "./libraries/CurveMath.sol";
import {FeeManager} from "./FeeManager.sol";

interface IWSwapRouter
{
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    )
        external
        payable
        returns (
            uint amountToken,
            uint amountETH,
            uint liquidity
        );
}

contract BondingCurve
{
    using CurveMath for uint;

    /// -------------------------
    /// CONFIG
    /// -------------------------

    address public constant WSWAP_ROUTER =
        0x617Fe3C8aF56e115e0E9742247Af0d4477240f53;

    address public constant WSWAP_FACTORY =
        0x2A44f013aD7D6a1083d8F499605Cf1148fbaCE31;

    address public constant WCO =
        0xEdB8008031141024d50cA2839A607B2f82C1c045;

    uint public constant LIQUIDITY_THRESHOLD = 50 ether;

    /// -------------------------
    /// STATE
    /// -------------------------

    WLaunchpadToken public token;
    FeeManager public feeManager;
    address public creator;

    uint public totalSupply;
    bool public migrated;

    /// -------------------------
    /// EVENTS
    /// -------------------------

    event Buy(address buyer, uint amount, uint cost);
    event Sell(address seller, uint amount, uint reward);
    event LiquidityMigrated(uint wcoAmount, uint tokenAmount);

    /// -------------------------
    /// CONSTRUCTOR
    /// -------------------------

    constructor(
        address _token,
        address _creator,
        address _feeManager
    )
    {
        token = WLaunchpadToken(_token);
        creator = _creator;
        feeManager = FeeManager(_feeManager);
    }

    /// -------------------------
    /// BUY COST
    /// -------------------------

    function getBuyCost(uint amount)
        public
        view
        returns(uint)
    {
        return CurveMath.calculatePrice(
            totalSupply,
            amount
        );
    }

    /// -------------------------
    /// SELL REWARD
    /// -------------------------

    function getSellReward(uint amount)
        public
        view
        returns(uint)
    {
        return CurveMath.calculateSellPrice(
            totalSupply,
            amount
        );
    }

    /// -------------------------
    /// BUY
    /// -------------------------

    function buy(uint amount)
        external
        payable
    {
        require(!migrated, "Curve migrated");

        uint cost = getBuyCost(amount);

        require(msg.value >= cost, "Insufficient WCO");

        (
            uint platformFee,
            uint creatorFee
        ) = feeManager.calculateFees(cost);

        payable(feeManager.platform())
            .transfer(platformFee);

        payable(creator)
            .transfer(creatorFee);

        totalSupply += amount;

        token.mint(
            msg.sender,
            amount
        );

        uint refund = msg.value - cost;

        if(refund > 0)
            payable(msg.sender).transfer(refund);

        emit Buy(
            msg.sender,
            amount,
            cost
        );

        /// MIGRATE IF THRESHOLD REACHED

        if(address(this).balance >= LIQUIDITY_THRESHOLD)
        {
            migrateLiquidity();
        }
    }

    /// -------------------------
    /// SELL
    /// -------------------------

    function sell(uint amount)
        external
    {
        require(!migrated, "Curve migrated");

        uint reward =
            getSellReward(amount);

        require(
            address(this).balance >= reward,
            "Insufficient liquidity"
        );

        token.burn(
            msg.sender,
            amount
        );

        totalSupply -= amount;

        payable(msg.sender)
            .transfer(reward);

        emit Sell(
            msg.sender,
            amount,
            reward
        );
    }

    /// -------------------------
    /// MIGRATE TO WSWAP
    /// -------------------------

    function migrateLiquidity()
        internal
    {
        require(!migrated);

        uint wcoAmount =
            address(this).balance;

        uint tokenAmount =
            token.balanceOf(address(this));

        token.approve(
            WSWAP_ROUTER,
            tokenAmount
        );

        IWSwapRouter(WSWAP_ROUTER)
            .addLiquidityETH{value: wcoAmount}
        (
            address(token),
            tokenAmount,
            0,
            0,
            address(0),
            block.timestamp + 360
        );

        migrated = true;

        emit LiquidityMigrated(
            wcoAmount,
            tokenAmount
        );
    }

    receive() external payable {}
}
