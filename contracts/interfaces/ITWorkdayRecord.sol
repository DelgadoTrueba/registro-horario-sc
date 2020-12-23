// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

interface ITWorkdayRecord {
    /* Evento a utilizar en el modal del calendario */
    event WorkdayRecordState(uint256 indexed dateRegister, uint8 state);

    /* Eventos necesario para obtener la trazabilidad del registro horario de un día
     ** DateIn & DateOut. action = new, modified
     ** Pauses. action => add, remove
     */
    event DateInEvent(uint256 indexed dateRegister, bool action, uint256 dateIn);
    event DateOutEvent(uint256 indexed dateRegister, bool action, uint256 dateOut);
    event PauseEvent(uint256 indexed dateRegister, bool action, uint256 dateIn, uint256 dateOut);

    /* Evento para obtener todos los registros de forma rapida
     **
     */
    event WorkdayRecordEvent(uint256 indexed dateRegister, uint256 dateIn, uint256[] pauses, uint256 dateOut, string comment);

    // Obtener el registro horario de un día
    function getWorkday(uint256 dateRegister)
        external
        view
        returns (
            uint256 dateIn,
            uint256 dateOut,
            uint256[] memory pauses,
            string memory comment,
            uint8 state
        );

    /* funcion manejadora del registro horario
     ** dateRegister (obligatorio), el resto opcional.
     ** dependiendo de los parametetros enviados llamará a una funcion u otra
     **   addDateIn(uint256 dateRegister, uint256 _dateIn);
     **   addDateOut(uint256 dateRegister, uint256 _dateOut);
     **   removePause(uint256 dateRegister, uint256 _dateIn, uint256 _dateOut);
     */
    function record(
        uint256 dateRegister,
        uint256 _dateIn,
        uint256 _dateOut,
        uint256[] calldata _pausesAdd,
        uint256[] calldata _pausesRemove,
        string calldata _comment
    ) external;

    function addDateIn(uint256 dateRegister, uint256 _dateIn) external;
}
