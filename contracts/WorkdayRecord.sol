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
    event DateInEvent(uint256 indexed dateRegister, uint256 dateIn);
    event DateOutEvent(uint256 indexed dateRegister, uint256 dateOut);
    event PauseEvent(uint256 indexed dateRegister, bool action, uint256 dateIn, uint256 dateOut);

    /* Evento para obtener todos los registros de forma rapida
     **
     */
    event WorkdayRecordEvent(uint256 indexed dateRegister, uint256 dateIn, uint256[] pauses, uint256 dateOut, string comment, uint8 state);

    enum State {UNREGISTERED, UNCOMPLETED, COMPLETED, MODIFIED}

    modifier atState(uint256 dateRegister, State state) {
        require(workDayRecord[dateRegister].state == state, "COD0");
        _;
    }

    modifier atLeast(uint256 dateRegister, State state) {
        require(workDayRecord[dateRegister].state >= state, "COD0");
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
        require(dateRegister % (24 hours) == 0, "COD20");
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
        require(_dateRegister != 0, "COD7");

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
                require((aux[j] > _dateRegister) && (aux[j] < (_dateRegister + 1 days)), "COD30");
                require(aux[j] > prev, "COD40");
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

        emit DateInEvent(dateRegister, _dateIn);
    }

    function setDateOut(uint256 dateRegister, uint256 _dateOut)
        private
        atLeast(dateRegister, State.UNCOMPLETED)
        transitionIfTo(dateRegister, State.UNCOMPLETED, State.COMPLETED)
        transitionIfTo(dateRegister, State.COMPLETED, State.MODIFIED)
    {
        workDayRecord[dateRegister].dateOut = _dateOut;

        emit DateOutEvent(dateRegister, _dateOut);
    }

    function addComment(uint256 dateRegister, string memory _comment) private atState(dateRegister, State.MODIFIED) {
        workDayRecord[dateRegister].comment = _comment;
    }

    function addPauses(uint256 dateRegister, uint256[] memory _pauses)
        private
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
        private
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
 ** COD7 -> Invalid dateRegister
 ** COD20 -> MEDIANOCHE
 ** COD30 -> NO MISMO DÍA
 ** COD40 -> TIMESTAMP NO ORDENADOS
 */
