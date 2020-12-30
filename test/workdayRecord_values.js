const { BN } = require('@openzeppelin/test-helpers');
const moment = require('moment');

const toTimeStamp = (date, time) =>  moment.utc(`${date}_${time}`, "DD-MM-YYYY_HH:mm", true).unix();

module.exports = Object.freeze({
    STATES: {
        UNREGISTERED: new BN(0),
        UNCOMPLETED: new BN(1),
        COMPLETED: new BN(2),
        MODIFIED: new BN(3)
    },
    CONST: {
        NEW: true,
        MODIFIED: false,
        ADD: true,
        REMOVE: false
    },
    WORKDAY_EXAMPLE: {
        dateRegister: new BN( toTimeStamp('22-12-2020', '00:00') ),
        dateIn: new BN( toTimeStamp('22-12-2020', '08:00') ),
        dateOut: new BN( toTimeStamp('22-12-2020', '17:15') ),
        comment: 'Comentario de Ejemlo',
        pauses: [
            toTimeStamp('22-12-2020', '15:00'), 
            toTimeStamp('22-12-2020', '15:30')
        ].map(timeStamp => new BN(timeStamp)),
        addPauses: [
            toTimeStamp('22-12-2020', '14:00'), 
            toTimeStamp('22-12-2020', '14:30'),
            toTimeStamp('22-12-2020', '15:00'), 
            toTimeStamp('22-12-2020', '15:30')
        ].map(timeStamp => new BN(timeStamp)),
        removePauses: [
            toTimeStamp('22-12-2020', '14:00'), 
            toTimeStamp('22-12-2020', '14:30')
        ].map(timeStamp => new BN(timeStamp)),
        OTHERS: {
            dateIn: new BN( toTimeStamp('22-12-2020', '08:45') ),
            dateOut: new BN( toTimeStamp('22-12-2020', '18:00') ),
            pause1: [toTimeStamp('22-12-2020', '13:00'), toTimeStamp('22-12-2020', '13:30')]
                        .map(timeStamp => new BN(timeStamp)),
            pause2: [toTimeStamp('22-12-2020', '14:00'), toTimeStamp('22-12-2020', '14:30')]
                        .map(timeStamp => new BN(timeStamp)),
            pause3: [toTimeStamp('22-12-2020', '15:00'), toTimeStamp('22-12-2020', '15:30')]
                        .map(timeStamp => new BN(timeStamp)),
            pause4: [toTimeStamp('22-12-2020', '16:00'), toTimeStamp('22-12-2020', '16:30')]
                        .map(timeStamp => new BN(timeStamp)),
            pauseOddLength: [toTimeStamp('22-12-2020', '14:00'), toTimeStamp('22-12-2020', '14:30'), toTimeStamp('22-12-2020', '15:00')]
                        .map(timeStamp => new BN(timeStamp)),
            unsortedPause:  [toTimeStamp('22-12-2020', '13:30'), toTimeStamp('22-12-2020', '13:00')]
                        .map(timeStamp => new BN(timeStamp)),
            invalidDateRegister: new BN( toTimeStamp('22-12-2020', '23:59') ),
        }
    },
    WORKDAY_EXAMPLE_2: {
        dateRegister: new BN( toTimeStamp('30-12-2020', '00:00') ),
        dateIn: new BN( toTimeStamp('30-12-2020', '08:00') ),
        dateOut: new BN( toTimeStamp('30-12-2020', '17:15') ),
        comment: 'Comentario de Ejemlo',
        pauses: [
            toTimeStamp('30-12-2020', '15:00'), 
            toTimeStamp('30-12-2020', '15:30')
        ].map(timeStamp => new BN(timeStamp)),
        OTHERS: {
            pause1: [toTimeStamp('30-12-2020', '13:00'), toTimeStamp('30-12-2020', '13:30')]
                        .map(timeStamp => new BN(timeStamp)),
            pause2: [toTimeStamp('30-12-2020', '14:00'), toTimeStamp('30-12-2020', '14:30')]
                        .map(timeStamp => new BN(timeStamp)),
            pause3: [toTimeStamp('30-12-2020', '15:00'), toTimeStamp('30-12-2020', '15:30')]
                        .map(timeStamp => new BN(timeStamp)),
        }
    }
});