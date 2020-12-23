// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./interfaces/ITWorkdayRecord.sol";

contract WorkdayRecord is ITWorkdayRecord {
    enum State {UNREGISTERED, UNCOMPLETED, COMPLETED, MODIFIED}

    struct Workday {
        uint256 dateIn;
        uint256 dateOut;
        string comment;
        uint256[] pauses;
        State state;
    }
    // dateRegister => struct
    mapping(uint256 => Workday) private workDayRecord;

    function getWorkday(uint256 dateRegister)
        external
        view
        override
        returns (
            uint256 dateIn,
            uint256 dateOut,
            uint256[] memory pauses,
            string memory comment,
            uint8 state
        )
    {
        return (
            workDayRecord[dateRegister].dateIn,
            workDayRecord[dateRegister].dateOut,
            workDayRecord[dateRegister].pauses,
            workDayRecord[dateRegister].comment,
            uint8(workDayRecord[dateRegister].state)
        );
    }

    function record(
        uint256 dateRegister,
        uint256 _dateIn,
        uint256 _dateOut,
        uint256[] calldata _pausesAdd,
        uint256[] calldata _pausesRemove,
        string calldata _comment
    ) external override {
        uint256 a = dateRegister;
        a = _dateIn;
        a = _dateOut;

        uint256[] memory b = _pausesAdd;
        b = _pausesRemove;

        string memory c = _comment;
        c = "";
    }

    function addDateIn(uint256 dateRegister, uint256 _dateIn) external override {
        uint256 prevDateIn = workDayRecord[dateRegister].dateIn;
        workDayRecord[dateRegister].dateIn = _dateIn;

        if (prevDateIn == 0) {
            workDayRecord[dateRegister].state = State.UNCOMPLETED;
            emit DateInEvent(
                dateRegister,
                /*NEW*/
                true,
                _dateIn
            );
        } else {
            emit DateInEvent(
                dateRegister,
                /*MODIFIED*/
                false,
                _dateIn
            );
        }
    }
}
