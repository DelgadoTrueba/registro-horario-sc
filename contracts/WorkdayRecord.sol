// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./Ownable.sol";

contract WorkdayRecord is Ownable {
    /* Evento a utilizar en el modal del calendario */
    event WorkdayRecordState(uint256 indexed dateRegister, uint8 state);

    /* Eventos necesario para obtener la trazabilidad del registro horario de un día
     ** DateIn & DateOut. action = new, modified
     ** Pauses. action => add, remove
     */
    event DateInEvent(uint256 indexed dateRegister, uint256 dateIn, uint8 state, uint256 timestamp);
    event DateOutEvent(uint256 indexed dateRegister, uint256 dateOut, uint8 state, uint256 timestamp);
    event PauseEvent(uint256 indexed dateRegister, bool action, uint256 dateIn, uint256 dateOut, uint8 state, uint256 timestamp);

    /* Evento para obtener todos los registros de forma rapida
     **
     */
    event WorkdayRecordEvent(uint256 indexed dateRegister, uint256 dateIn, uint256[] pauses, uint256 dateOut, string comment, uint8 state);

    enum State {UNREGISTERED, UNCOMPLETED, COMPLETED, MODIFIED}

    modifier atState(uint256 dateRegister, State state) {
        require(workDayRecord[dateRegister].state == state, "WorkdayRecord:COD0");
        _;
    }

    modifier atLeast(uint256 dateRegister, State state) {
        require(workDayRecord[dateRegister].state >= state, "WorkdayRecord:COD0");
        _;
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

    modifier isDateRegisterMidnight(uint256 dateRegister) {
        require((dateRegister > 0) && (dateRegister % (24 hours) == 0), "WorkdayRecord:COD1");
        _;
    }

    struct Workday {
        uint256 dateIn;
        uint256 dateOut;
        uint256[] pauses;
        State state;
        string comment;
    }
    // dateRegister => struct
    mapping(uint256 => Workday) private workDayRecord;

    function getWorkday(uint256 dateRegister)
        external
        view
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
        uint256 _dateRegister,
        uint256 _dateIn,
        uint256 _dateOut,
        uint256[] calldata _pausesAdd,
        uint256[] calldata _pausesRemove,
        string calldata _comment
    ) external onlyOwner isDateRegisterMidnight(_dateRegister) {
        if (_dateIn != 0) setDateIn(_dateRegister, _dateIn);
        if (_pausesAdd.length != 0) addPauses(_dateRegister, _pausesAdd);
        if (_pausesRemove.length != 0) removePauses(_dateRegister, _pausesRemove);
        if (_dateOut != 0) setDateOut(_dateRegister, _dateOut);

        if (bytes(_comment).length != 0) addComment(_dateRegister, _comment);

        checkTimestamps(_dateRegister);
        emitWorkdayRecord(_dateRegister);
    }

    function emitWorkdayRecord(uint256 _dateRegister) private {
        emit WorkdayRecordEvent(
            _dateRegister,
            workDayRecord[_dateRegister].dateIn,
            workDayRecord[_dateRegister].pauses,
            workDayRecord[_dateRegister].dateOut,
            workDayRecord[_dateRegister].comment,
            uint8(workDayRecord[_dateRegister].state)
        );
    }

    function checkTimestamps(uint256 _dateRegister) private view {
        uint256[] memory aux = new uint256[](workDayRecord[_dateRegister].pauses.length + 2);

        aux[0] = workDayRecord[_dateRegister].dateIn;
        for (uint8 i = 0; i < workDayRecord[_dateRegister].pauses.length; i++) {
            aux[i + 1] = workDayRecord[_dateRegister].pauses[i];
        }
        aux[aux.length - 1] = workDayRecord[_dateRegister].dateOut;

        uint256 prev = 0;
        for (uint8 j = 0; j < aux.length; j++) {
            if (aux[j] != 0) {
                require((aux[j] > _dateRegister) && (aux[j] < (_dateRegister + 1 days)), "WorkdayRecord:COD2");
                require(aux[j] > prev, "WorkdayRecord:COD3");
            }
            prev = aux[j];
        }
    }

    function setDateIn(uint256 dateRegister, uint256 _dateIn)
        private
        transitionIfTo(dateRegister, State.UNREGISTERED, State.UNCOMPLETED)
        transitionIfTo(dateRegister, State.COMPLETED, State.MODIFIED)
    {
        workDayRecord[dateRegister].dateIn = _dateIn;

        emit DateInEvent(dateRegister, _dateIn, uint8(workDayRecord[dateRegister].state), block.timestamp);
    }

    function setDateOut(uint256 dateRegister, uint256 _dateOut)
        private
        atLeast(dateRegister, State.UNCOMPLETED)
        transitionIfTo(dateRegister, State.UNCOMPLETED, State.COMPLETED)
        transitionIfTo(dateRegister, State.COMPLETED, State.MODIFIED)
    {
        workDayRecord[dateRegister].dateOut = _dateOut;

        emit DateOutEvent(dateRegister, _dateOut, uint8(workDayRecord[dateRegister].state), block.timestamp);
    }

    function addComment(uint256 dateRegister, string memory _comment) private atState(dateRegister, State.MODIFIED) {
        workDayRecord[dateRegister].comment = _comment;
    }

    function addPauses(uint256 dateRegister, uint256[] memory _pauses)
        private
        atLeast(dateRegister, State.UNCOMPLETED)
        transitionIfTo(dateRegister, State.COMPLETED, State.MODIFIED)
    {
        require(_pauses.length % 2 == 0, "WorkdayRecord:COD4");
        for (uint256 i = 0; i < _pauses.length; i = i + 2) {
            addPause(dateRegister, _pauses[i], _pauses[i + 1]);
        }
    }

    function addPause(
        uint256 dateRegister,
        uint256 _dateIn,
        uint256 _dateOut
    ) private {
        require(workDayRecord[dateRegister].pauses.length < 6, "WorkdayRecord:COD5");
        workDayRecord[dateRegister].pauses.push(_dateIn);
        workDayRecord[dateRegister].pauses.push(_dateOut);
        emit PauseEvent(
            dateRegister,
            /*ADD*/
            true,
            _dateIn,
            _dateOut,
            uint8(workDayRecord[dateRegister].state),
            block.timestamp
        );
    }

    function removePauses(uint256 dateRegister, uint256[] memory _pauses)
        private
        atLeast(dateRegister, State.UNCOMPLETED)
        transitionIfTo(dateRegister, State.COMPLETED, State.MODIFIED)
    {
        require(workDayRecord[dateRegister].pauses.length > 0, "WorkdayRecord:COD6");
        require(_pauses.length % 2 == 0, "WorkdayRecord:COD4");
        for (uint256 i = 0; i < _pauses.length; i = i + 2) {
            uint256[] storage pauses = workDayRecord[dateRegister].pauses;
            removePause(pauses, _pauses[i], _pauses[i + 1]);
            emit PauseEvent(
                dateRegister,
                /*REMOVE*/
                false,
                _pauses[i],
                _pauses[i + 1],
                uint8(workDayRecord[dateRegister].state),
                block.timestamp
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
        require(find, "WorkdayRecord:COD7");
    }

    function removeElement(uint256[] storage array, uint256 index) private {
        require((index < array.length) && (index >= 0), "WorkdayRecord:COD8");

        for (uint256 i = index; i < array.length - 1; i++) {
            array[i] = array[i + 1];
        }
        array.pop();
    }
}

// Error String
/*  - WorkdayRecord:COD0 -> this function cannot be called at this stage
 ** - WorkdayRecord:COD1 -> invalid dateRegister. DateRegister must be at midnight
 ** - WorkdayRecord:COD2 -> dateIn, pauses, dateOut must be from same day
 ** - WorkdayRecord:COD3 -> workday info must be sorted (dateIn < pauses < dateIn)
 ** - WorkdayRecord:COD4 -> Pauses array must be even
 ** - WorkdayRecord:COD5 -> exceeded the maximum number of recorded pauses (3)
 ** - WorkdayRecord:COD6 -> pauses array is empty
 ** - WorkdayRecord:COD7 -> pause.dateIn or pause.DateOut not exist
 **   WorkdayRecord:COD8 -> Invalid index, in removeElement operation
 */
