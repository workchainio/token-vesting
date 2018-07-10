pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC20/TokenVesting.sol";
import "./VestingSchedule.sol";
//The token contract is not a dependency but is used in tests so importing it here for compilation
import "watt-token/contracts/WATTToken.sol";

contract VestingAccount is TokenVesting
{
    VestingSchedule public vesting_schedule;

    /**
    * @dev Creates a vesting contract that vests its balance of any ERC20 token according
    * to a vesting schedule (start, cliff, duration) stored in another contract.
    * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
    * @param _schedule_address address of the VestingSchedule contract containing start, cliff and duration values
    * @param _revocable whether the vesting is revocable or not
    */
    constructor(
        address _beneficiary,
        address _schedule_address,
        bool _revocable
    ) TokenVesting(_beneficiary,
                    /* start, cliff and duration params in the parent contract will not be used.*/
                    uint256(32503680000),  //start is set to Jan 1st Year 30000
                    uint256(31536000000),  //cliff is 1000 years in seconds
                    uint256(31536000000), //duration is 1000 years in seconds,
                    _revocable) 
    public
    {
        require(_schedule_address != address(0));
        vesting_schedule = VestingSchedule(_schedule_address);
    }

    /**
    * @dev Calculates the amount that has already vested.
    * @param token ERC20 token which is being vested
    */
    function vestedAmount(ERC20Basic token) public view returns (uint256) {
        uint256 currentBalance = token.balanceOf(this);
        uint256 totalBalance = currentBalance.add(released[token]);

        if (block.timestamp < (vesting_schedule.start().add(vesting_schedule.cliff()))) {
            return 0;
        }
        else if (block.timestamp >= vesting_schedule.start().add(vesting_schedule.duration()) || revoked[token]) {
            return totalBalance;
        }
        else {
            return totalBalance.mul(block.timestamp.sub(vesting_schedule.start())).div(vesting_schedule.duration());
        }
    }
}