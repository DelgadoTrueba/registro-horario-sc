// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./interfaces/Factory.sol";
import "./WorkdayRecord.sol";

contract WorkdayRecordFactory is Factory {
    address[] private workdayRecordAddress;

    function create() public override returns (address) {
        WorkdayRecord workdayRecord = new WorkdayRecord();

        workdayRecordAddress.push(address(workdayRecord));
        return address(workdayRecord);
    }

    function getContracts() public view override returns (address[] memory) {
        return workdayRecordAddress;
    }
}
