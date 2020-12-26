// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./interfaces/ITWorkdayRecord.sol";

contract WorkdayRecord is ITWorkdayRecord {
    enum State {UNREGISTERED, UNCOMPLETED, COMPLETED, MODIFIED}

    modifier atState(uint256 dateRegister, State state) {
        require(workDayRecord[dateRegister].state == state, "COD0");
        _;
    }

    modifier atLeast(uint256 dateRegister, State state) {
        require(workDayRecord[dateRegister].state >= state, "COD0");
        _;
    }

    modifier transitionTo(uint256 dateRegister, State state) {
        _;
        advanceState(dateRegister, state);
    }

    modifier transitionIfTo(
        uint256 dateRegister,
        State stateIf,
        State stateTo
    ) {
        _;
        if (workDayRecord[dateRegister].state == stateIf) {
            advanceState(dateRegister, stateTo);
        }
    }

    function advanceState(uint256 dateRegister, State state) private {
        workDayRecord[dateRegister].state = state;
        emit WorkdayRecordState(dateRegister, uint8(state));
    }

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

    function addDateIn(uint256 dateRegister, uint256 _dateIn)
        external
        override
        atState(dateRegister, State.UNREGISTERED)
        transitionTo(dateRegister, State.UNCOMPLETED)
    {
        dateIn(
            dateRegister,
            /*NEW*/
            true,
            _dateIn
        );
    }

    function changeDateIn(uint256 dateRegister, uint256 _dateIn)
        external
        override
        atLeast(dateRegister, State.UNCOMPLETED)
        transitionIfTo(dateRegister, State.COMPLETED, State.MODIFIED)
    {
        dateIn(
            dateRegister,
            /*MODIFIED*/
            false,
            _dateIn
        );
    }

    function dateIn(
        uint256 dateRegister,
        bool action,
        uint256 _dateIn
    ) private {
        workDayRecord[dateRegister].dateIn = _dateIn;

        emit DateInEvent(dateRegister, action, _dateIn);
    }

    function addDateOut(uint256 dateRegister, uint256 _dateOut)
        external
        override
        atState(dateRegister, State.UNCOMPLETED)
        transitionTo(dateRegister, State.COMPLETED)
    {
        dateOut(
            dateRegister,
            /*NEW*/
            true,
            _dateOut
        );
    }

    function changeDateOut(uint256 dateRegister, uint256 _dateOut)
        external
        override
        atLeast(dateRegister, State.COMPLETED)
        transitionIfTo(dateRegister, State.COMPLETED, State.MODIFIED)
    {
        dateOut(
            dateRegister,
            /*MODIFED*/
            false,
            _dateOut
        );
    }

    function dateOut(
        uint256 dateRegister,
        bool action,
        uint256 _dateOut
    ) private {
        workDayRecord[dateRegister].dateOut = _dateOut;

        emit DateOutEvent(dateRegister, action, _dateOut);
    }

    function addComment(uint256 dateRegister, string calldata _comment) external override atState(dateRegister, State.MODIFIED) {
        workDayRecord[dateRegister].comment = _comment;
    }

    function addPauses(uint256 dateRegister, uint256[] calldata _pauses)
        external
        override
        atLeast(dateRegister, State.UNCOMPLETED)
        transitionIfTo(dateRegister, State.COMPLETED, State.MODIFIED)
    {
        require(_pauses.length % 2 == 0, "COD1");
        for (uint256 i = 0; i < _pauses.length; i = i + 2) {
            addPause(dateRegister, _pauses[i], _pauses[i + 1]);
        }
    }

    function addPause(
        uint256 dateRegister,
        uint256 _dateIn,
        uint256 _dateOut
    ) private {
        require(workDayRecord[dateRegister].pauses.length < 6, "COD2");
        workDayRecord[dateRegister].pauses.push(_dateIn);
        workDayRecord[dateRegister].pauses.push(_dateOut);
        emit PauseEvent(
            dateRegister,
            /*ADD*/
            true,
            _dateIn,
            _dateOut
        );
    }

    function removePauses(uint256 dateRegister, uint256[] memory _pauses)
        external
        override
        atLeast(dateRegister, State.UNCOMPLETED)
        transitionIfTo(dateRegister, State.COMPLETED, State.MODIFIED)
    {
        require(workDayRecord[dateRegister].pauses.length > 0, "COD6");
        require(_pauses.length % 2 == 0, "COD1");
        require(workDayRecord[dateRegister].pauses.length >= _pauses.length, "COD5");
        for (uint256 i = 0; i < _pauses.length; i = i + 2) {
            uint256[] storage pauses = workDayRecord[dateRegister].pauses;
            removePause(pauses, _pauses[i], _pauses[i + 1]);
            emit PauseEvent(
                dateRegister,
                /*REMOVE*/
                false,
                _pauses[i],
                _pauses[i + 1]
            );
        }
    }

    function removePause(
        uint256[] storage pauses,
        uint256 _dateIn,
        uint256 _dateOut
    ) private {
        bool find = false;

        for (uint256 i = 0; i < (pauses.length - 1) && !find; i++) {
            if (pauses[i] == _dateIn && pauses[i + 1] == _dateOut) {
                find = true;
                removeElement(pauses, i);
                removeElement(pauses, i);
            }
        }
        require(find, "COD3");
    }

    function removeElement(uint256[] storage array, uint256 index) private {
        require((index < array.length) && (index >= 0), "COD4");

        for (uint256 i = index; i < array.length - 1; i++) {
            array[i] = array[i + 1];
        }
        array.pop();
    }
}

// Error String
/*  0x0 -> This function cannot be called at this stage.
 ** COD1 -> Pauses array must be even
 ** COD2 -> Excedido el numero maximo de pausas registradas (6/2 = 3)
 ** COD3 -> pause.dateIn or pause.DateOut not exist
 ** COD4 -> Invalid index, in removeElement operation
 ** COD5 -> REMOVE ARRAY TO LONGH
 ** COD6 -> pauses array is empty
 */
