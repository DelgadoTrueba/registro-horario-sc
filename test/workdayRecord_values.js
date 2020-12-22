const moment = require('moment');

const toTimeStamp = (date, time) =>  moment(`${date}_${time}`, "DD-MM-YYYY_HH:mm", true).format("x");

module.exports = Object.freeze({
    STATES: {
        UNREGISTERED: 0,
        UNCOMPLETED: 1,
        COMPLETED: 2
    },
    UNREGISTERED: {
        dateRegister: toTimeStamp('22-12-2020', '00:00')
    }
});