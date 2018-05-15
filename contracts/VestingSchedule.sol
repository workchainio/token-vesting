pragma solidity ^0.4.21;

contract VestingSchedule
{
    uint256 public start;
    uint256 public cliff;
    uint256 public duration;

    constructor(uint256 _start, uint256 _cliff, uint256 _duration) public {
        require(_cliff <= _duration);
        start = _start;
        cliff = _cliff;
        duration = _duration;
    }
}