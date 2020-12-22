/**********************************************************************/// SMART CONTRACTS
const WorkdayRecordContract = artifacts.require("WorkdayRecord");
/**********************************************************************/// CONSTANTS
const WorkdayRecordValues = require('./workdayRecord_values')
const BN = web3.utils.BN; 

contract("WorkdayRecord Contract:", (accounts) => {

    const {
        STATES, 
        UNREGISTERED
    } = WorkdayRecordValues;

    let instance;

    beforeEach(async function() {
        instance = await WorkdayRecordContract.new();
    });

    it("should be possible to get the workdayInfo (dateIn, dateOut, pauses, comment and state) of a day", async () => {
        let callResul = await instance.getWorkday(new BN(UNREGISTERED.dateRegister));
       
        const ZERO = new BN(0);
        assert.equal(callResul.state.eq(new BN(STATES.UNREGISTERED)), true, `state must be UNREGISTERED`);
        assert.equal(callResul.dateIn.eq(ZERO), true, `dateIn must be ${ZERO.toString()}`);
        assert.equal(callResul.dateOut.eq(ZERO), true, `dateOut must be ${ZERO.toString()}`);
        assert.equal(callResul.pauses.length, 0, `pauses must be empty`);
        assert.equal(callResul.comment, "", `comment must be empty`);
    })
});