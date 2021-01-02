// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./WorkdayRecordFactory.sol";

contract WorkdayRecordController {
    event NewWorkdayRecord(uint256 numEmployee, address workdayRecordAddress, uint256 timestamp);

    //numEmployee => scAdress
    mapping(uint256 => address) private controller;

    WorkdayRecordFactory private workdayFactory;

    constructor(address workdayFactoryAddress) {
        workdayFactory = WorkdayRecordFactory(workdayFactoryAddress);
    }

    function createWorkdayRecord(uint256 numEmployee) external {
        require(controller[numEmployee] == address(0), "WorkdayRecordController:COD0");

        controller[numEmployee] = workdayFactory.create();
        emit NewWorkdayRecord(numEmployee, controller[numEmployee], block.timestamp);
    }

    function getWorkdayRecord(uint256 numEmployee) external view returns (address) {
        return controller[numEmployee];
    }
}
/** Error string
 ** WorkdayRecordController:COD0: Currently there is a workdayRecord, you cannot create one again (update it)
 */
