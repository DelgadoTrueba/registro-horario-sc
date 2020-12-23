const moment = require('moment');

const toTimeStamp = (date, time) =>  moment(`${date}_${time}`, "DD-MM-YYYY_HH:mm", true).format("x");

module.exports = Object.freeze({
    STATES: {
        UNREGISTERED: 0,
        UNCOMPLETED: 1,
        COMPLETED: 2
    },
    CONST: {
        NEW: true,
        MODIFIED: false
    },
    WORKDAY_INFO: {
        dateRegister: toTimeStamp('22-12-2020', '00:00'),
        dateIn: toTimeStamp('22-12-2020', '08:00')
    }
});