const { BN } = require('@openzeppelin/test-helpers');
const moment = require('moment');

const toTimeStamp = (date, time) =>  moment(`${date}_${time}`, "DD-MM-YYYY_HH:mm", true).format("x");

module.exports = Object.freeze({
    STATES: {
        UNREGISTERED: new BN(0),
        UNCOMPLETED: new BN(1),
        COMPLETED: new BN(2),
        MODIFIED: new BN(3)
    },
    CONST: {
        NEW: true,
        MODIFIED: false
    },
    WORKDAY_EXAMPLE: {
        dateRegister: new BN( toTimeStamp('22-12-2020', '00:00') ),
        dateIn: new BN( toTimeStamp('22-12-2020', '08:00') ),
        dateOut: new BN( toTimeStamp('22-11-2020', '17:15') ),
        OTHERS: {
            dateIn: new BN( toTimeStamp('22-12-2020', '08:45') ),
            dateOut: new BN( toTimeStamp('22-11-2020', '18:00') )
        }
    },
});