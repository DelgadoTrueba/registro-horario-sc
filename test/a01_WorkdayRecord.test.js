/**********************************************************************/// SMART CONTRACTS
const WorkdayRecordContract = artifacts.require("WorkdayRecord");
/**********************************************************************/// CONSTANTS
const WorkdayRecordValues = require('./workdayRecord_values')
const {
    BN,
    expectEvent
  } = require('@openzeppelin/test-helpers');

contract("WorkdayRecord Contract:", (accounts) => {

    const {
        STATES, 
        CONST,
        WORKDAY_INFO
    } = WorkdayRecordValues;

    let instance;

    describe('UNREGISTERED STATE', () => {

        before(async function() {
            instance = await WorkdayRecordContract.new();
        });
    
        it("should be possible to get the workdayInfo (dateIn, dateOut, pauses, comment and state) of a unregistered day", async () => {
            const dateRegister = new BN(WORKDAY_INFO.dateRegister);
            const ZERO = new BN(0);

            let callResul = await instance.getWorkday(dateRegister);
           
            assert.equal(callResul.state.eq(new BN(STATES.UNREGISTERED)), true, `state must be UNREGISTERED`);
            assert.equal(callResul.dateIn.eq(ZERO), true, `dateIn must be ${ZERO.toString()}`);
            assert.equal(callResul.dateOut.eq(ZERO), true, `dateOut must be ${ZERO.toString()}`);
            assert.equal(callResul.pauses.length, 0, `pauses must be empty`);
            assert.equal(callResul.comment, "", `comment must be empty`);
        })
    
        it("should be possible to add dateIn in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_INFO.dateRegister);
            const dateIn = new BN(WORKDAY_INFO.dateIn);
            
            let txReceipt = await instance.addDateIn(dateRegister, dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {dateRegister, action: CONST.NEW, dateIn });
        })

        it("should be possible to get dateIn in a day´s record", async () => {
            const dateRegister = new BN(WORKDAY_INFO.dateRegister);
            const dateIn = new BN(WORKDAY_INFO.dateIn);
            const ZERO = new BN(0);

            let callResul = await instance.getWorkday(dateRegister);
           
            assert.equal(callResul.state.eq(new BN(STATES.UNCOMPLETED)), true, `state must be UNCOMPLETED`);
            assert.equal(callResul.dateIn.eq(dateIn), true, `dateIn must be ${dateIn.toString()}`);
            assert.equal(callResul.dateOut.eq(ZERO), true, `dateOut must be ${ZERO.toString()}`);
            assert.equal(callResul.pauses.length, 0, `pauses must be empty`);
            assert.equal(callResul.comment, "", `comment must be empty`);
        })

    });
    
});