/**********************************************************************/// SMART CONTRACTS
const WorkdayRecordContract = artifacts.require("WorkdayRecord");
/**********************************************************************/// CONSTANTS
const WorkdayRecordValues = require('./workdayRecord_values')
const {
    BN,
    expectEvent,
    expectRevert 
} = require('@openzeppelin/test-helpers');
const ZERO = new BN(0);

contract("WorkdayRecord Contract:", (accounts) => {

    const {
        STATES, 
        CONST,
        WORKDAY_EXAMPLE,
    } = WorkdayRecordValues;

    let instance;

    const checkWorkdayInfo = (callResul, state, dateIn, dateOut, pauses, comment) => {
        assert.equal(callResul.state.eq(new BN(state)), true, `state must be ${state}`);
        assert.equal(callResul.dateIn.eq(new BN(dateIn)), true, `dateIn must be ${ZERO.toString()}`);
        assert.equal(callResul.dateOut.eq(new BN(dateOut)), true, `dateOut must be ${ZERO.toString()}`);
        assert.equal(callResul.pauses.length, 0, `pauses must be empty`);
        assert.equal(callResul.comment, "", `comment must be empty`);
    }

    describe('UNREGISTERED STATE', () => {

        beforeEach(async function() {
            instance = await WorkdayRecordContract.new();
        });
        
        it("should not be possible to change an dateIn before add one in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.dateIn);
            
            await expectRevert.unspecified(
                instance.changeDateIn(dateRegister, dateIn),
                "COD0"
            );
        })

        it("should not be possible to add dateOut in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateOut = new BN(WORKDAY_EXAMPLE.dateOut);
            
            await expectRevert.unspecified(
                instance.addDateOut(dateRegister, dateOut)
            );
        })

        it("should not be possible to change dateOut in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateOut = new BN(WORKDAY_EXAMPLE.dateOut);
            
            await expectRevert.unspecified(
                instance.changeDateOut(dateRegister, dateOut)
            );
        })
    
        it("should be possible to add an initial dateIn in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.dateIn);
            const UNCOMPLETED = new BN(STATES.UNCOMPLETED)

            let callResul;
            callResul = await instance.getWorkday(dateRegister);
            checkWorkdayInfo(callResul, STATES.UNREGISTERED, 0, 0, null, null);
            
            let txReceipt = await instance.addDateIn(dateRegister, dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {dateRegister, action: CONST.NEW, dateIn });
            expectEvent(txReceipt, 'WorkdayRecordState', {dateRegister, state: UNCOMPLETED});

            callResul = await instance.getWorkday(dateRegister);
            checkWorkdayInfo(callResul, STATES.UNCOMPLETED, dateIn, 0, null, null);
        })
    });
    
    describe('UNCOMPLETED STATE', () => {

        beforeEach(async function() {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.dateIn);

            instance = await WorkdayRecordContract.new();
            await instance.addDateIn(dateRegister, dateIn);
        });

        it("should not be possible to add an initial dateIn in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.OTHERS.dateIn);
            
            await expectRevert.unspecified(
                instance.addDateIn(dateRegister, dateIn),
                "COD0"
            );
          
        })
        
        it("should not be possible to change dateOut before add one in a day´s record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateOut = new BN(WORKDAY_EXAMPLE.dateOut);
            
            await expectRevert.unspecified(
                instance.changeDateOut(dateRegister, dateOut),
                "COD0"
            );
        })

        it("should be possible to change dateIn in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.OTHERS.dateIn);

            let callResul;
            callResul = await instance.getWorkday(dateRegister);
            checkWorkdayInfo(callResul, STATES.UNCOMPLETED, WORKDAY_EXAMPLE.dateIn, 0, null, null);
            
            let txReceipt = await instance.changeDateIn(dateRegister, dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {dateRegister, action: CONST.MODIFIED, dateIn });

            callResul = await instance.getWorkday(dateRegister);
            checkWorkdayInfo(callResul, STATES.UNCOMPLETED, dateIn, 0, null, null);
        })

        it("should be possible to add dateOut in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateOut = new BN(WORKDAY_EXAMPLE.dateOut);
            const COMPLETED = new BN(STATES.COMPLETED);

            let callResul;
            callResul = await instance.getWorkday(dateRegister);
            checkWorkdayInfo(callResul, STATES.UNCOMPLETED, WORKDAY_EXAMPLE.dateIn, 0, null, null);
            
            let txReceipt = await instance.addDateOut(dateRegister, dateOut);
    
            expectEvent(txReceipt, 'DateOutEvent', {dateRegister, action: CONST.NEW, dateOut });
            expectEvent(txReceipt, 'WorkdayRecordState', {dateRegister, state: COMPLETED});

            callResul = await instance.getWorkday(dateRegister);
            checkWorkdayInfo(callResul, STATES.COMPLETED, WORKDAY_EXAMPLE.dateIn, dateOut, null, null);
        })

    });

    describe('COMPLETED STATE', () => {

        beforeEach(async() => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.dateIn);
            const dateOut = new BN(WORKDAY_EXAMPLE.dateOut);

            instance = await WorkdayRecordContract.new();
            await instance.addDateIn(dateRegister, dateIn);
            await instance.addDateOut(dateRegister, dateOut)
        });

        it("should not be posible to add initial dateIn", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.dateIn);
            
            await expectRevert.unspecified(
                instance.addDateIn(dateRegister, dateIn)
            );
        })

        it("should not be posible to add initial dateOut", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateOut = new BN(WORKDAY_EXAMPLE.dateOut);
            
            await expectRevert.unspecified(
                instance.addDateOut(dateRegister, dateOut)
            );
        })

        it("should be possible to change dateIn in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.OTHERS.dateIn);
            const MODIFIED = new BN(STATES.MODIFIED)

            let callResul;
            callResul = await instance.getWorkday(dateRegister);
            checkWorkdayInfo(callResul, STATES.COMPLETED, WORKDAY_EXAMPLE.dateIn, WORKDAY_EXAMPLE.dateOut, null, null);

            let txReceipt = await instance.changeDateIn(dateRegister, dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {dateRegister, action: CONST.MODIFIED, dateIn });
            expectEvent(txReceipt, 'WorkdayRecordState', {dateRegister, state: MODIFIED});

            callResul = await instance.getWorkday(dateRegister);
            checkWorkdayInfo(callResul, STATES.MODIFIED, dateIn, WORKDAY_EXAMPLE.dateOut, null, null);
        })

        it("should be possible to change dateOut in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            dateOut = new BN(WORKDAY_EXAMPLE.OTHERS.dateOut);
            const MODIFIED = new BN(STATES.MODIFIED)

            let callResul;
            callResul = await instance.getWorkday(dateRegister);
            checkWorkdayInfo(callResul, STATES.COMPLETED, WORKDAY_EXAMPLE.dateIn, WORKDAY_EXAMPLE.dateOut, null, null);

            let txReceipt = await instance.changeDateOut(dateRegister, dateOut);
    
            expectEvent(txReceipt, 'DateOutEvent', {dateRegister, action: CONST.MODIFIED, dateOut });
            expectEvent(txReceipt, 'WorkdayRecordState', {dateRegister, state: MODIFIED});

            callResul = await instance.getWorkday(dateRegister);
            checkWorkdayInfo(callResul, STATES.MODIFIED, WORKDAY_EXAMPLE.dateIn, dateOut, null, null);
        })
    })

    describe('MODIFIED STATE', () => {

        beforeEach(async() => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.dateIn);
            const dateOut = new BN(WORKDAY_EXAMPLE.dateOut);
    
            instance = await WorkdayRecordContract.new();
            await instance.addDateIn(dateRegister, dateIn);
            await instance.addDateOut(dateRegister, dateOut)
            await instance.changeDateIn(dateRegister, dateIn)
        });

        it("should not be posible to add initial dateIn", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.dateIn);
            
            await expectRevert.unspecified(
                instance.addDateIn(dateRegister, dateIn)
            );
        })

        it("should not be posible to add initial dateOut", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateOut = new BN(WORKDAY_EXAMPLE.dateOut);
            
            await expectRevert.unspecified(
                instance.addDateOut(dateRegister, dateOut)
            );
        })

        it("should be possible to change dateIn in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.OTHERS.dateIn);
            
            let callResul;
            callResul = await instance.getWorkday(dateRegister);
            checkWorkdayInfo(callResul, STATES.MODIFIED, WORKDAY_EXAMPLE.dateIn,  WORKDAY_EXAMPLE.dateOut, null, null);

            let txReceipt = await instance.changeDateIn(dateRegister, dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {dateRegister, action: CONST.MODIFIED, dateIn });

            callResul = await instance.getWorkday(dateRegister);
            checkWorkdayInfo(callResul, STATES.MODIFIED, dateIn,  WORKDAY_EXAMPLE.dateOut, null, null);
        })

        it("should be possible to change dateIn in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateOut = new BN(WORKDAY_EXAMPLE.OTHERS.dateOut);

            let callResul;
            callResul = await instance.getWorkday(dateRegister);
            checkWorkdayInfo(callResul, STATES.MODIFIED, WORKDAY_EXAMPLE.dateIn,  WORKDAY_EXAMPLE.dateOut, null, null);

            let txReceipt = await instance.changeDateOut(dateRegister, dateOut);
    
            expectEvent(txReceipt, 'DateOutEvent', {dateRegister, action: CONST.MODIFIED, dateOut });

            callResul = await instance.getWorkday(dateRegister);
            checkWorkdayInfo(callResul, STATES.MODIFIED, WORKDAY_EXAMPLE.dateIn,  dateOut, null, null);
        })

    })
});