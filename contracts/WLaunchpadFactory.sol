// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./WLaunchpadToken.sol";
import "./BondingCurve.sol";
import "./FeeManager.sol";

contract WLaunchpadFactory
{
    address public owner;

    FeeManager public feeManager;

    address[] public tokens;

    event LaunchCreated(
        address token,
        address curve,
        address creator
    );

    constructor(address _feeManager)
    {
        owner = msg.sender;
        feeManager = FeeManager(_feeManager);
    }

    function createLaunch(
        string memory name,
        string memory symbol
    )
        external
        returns(address, address)
    {
        WLaunchpadToken token =
            new WLaunchpadToken(
                name,
                symbol,
                msg.sender,
                address(this)
            );

        BondingCurve curve =
            new BondingCurve(
                address(token),
                msg.sender,
                address(feeManager)
            );

        token.setBondingCurve(address(curve));

        tokens.push(address(token));

        emit LaunchCreated(
            address(token),
            address(curve),
            msg.sender
        );

        return (
            address(token),
            address(curve)
        );
    }
}
