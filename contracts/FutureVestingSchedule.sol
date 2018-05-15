pragma solidity ^0.4.21;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./VestingSchedule.sol";

contract FutureVestingSchedule is Ownable, VestingSchedule{

    constructor(
        uint256 _cliff, 
        uint256 _duration
    ) VestingSchedule(uint256(32503680000), _cliff, _duration) public { //start is set to Jan 1st Year 3000

    }

    /**
        Can be called in the future to set the start date once it is known 
        (e.g. once the token gets listed on an exchange)
     */
    function setStart(uint256 _timestamp) public onlyOwner returns (uint256){
        start = _timestamp;
        return start;
    }
}