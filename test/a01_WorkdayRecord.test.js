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

    describe('UNREGISTERED STATE', () => {

        before(async function() {
            instance = await WorkdayRecordContract.new();
        });
    
        it("should be possible to get the workdayInfo (dateIn, dateOut, pauses, comment and state) of a unregistered day", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);

            let callResul = await instance.getWorkday(dateRegister);
           
            assert.equal(callResul.state.eq(new BN(STATES.UNREGISTERED)), true, `state must be UNREGISTERED`);
            assert.equal(callResul.dateIn.eq(ZERO), true, `dateIn must be ${ZERO.toString()}`);
            assert.equal(callResul.dateOut.eq(ZERO), true, `dateOut must be ${ZERO.toString()}`);
            assert.equal(callResul.pauses.length, 0, `pauses must be empty`);
            assert.equal(callResul.comment, "", `comment must be empty`);
        })

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
            
            let txReceipt = await instance.addDateIn(dateRegister, dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {dateRegister, action: CONST.NEW, dateIn });
            expectEvent(txReceipt, 'WorkdayRecordState', {dateRegister, state: UNCOMPLETED});
        })

        it("should be possible to get dateIn in a day´s record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.dateIn);
            const UNCOMPLETED = new BN(STATES.UNCOMPLETED)

            let callResul = await instance.getWorkday(dateRegister);
           
            assert.equal(callResul.state.eq(UNCOMPLETED), true, `state must be UNCOMPLETED`);
            assert.equal(callResul.dateIn.eq(dateIn), true, `dateIn must be ${dateIn.toString()}`);
            assert.equal(callResul.dateOut.eq(ZERO), true, `dateOut must be ${ZERO.toString()}`);
            assert.equal(callResul.pauses.length, 0, `pauses must be empty`);
            assert.equal(callResul.comment, "", `comment must be empty`);
        })

    });
    
    describe('UNCOMPLETED STATE', () => {

        before(async function() {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.dateIn);

            instance = await WorkdayRecordContract.new();
            await instance.addDateIn(dateRegister, dateIn);
        });

        it("should be possible to get the workdayInfo (dateIn, dateOut, pauses, comment and state) of a unregistered day", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.dateIn);

            let callResul = await instance.getWorkday(dateRegister);
           
            assert.equal(callResul.state.eq(new BN(STATES.UNCOMPLETED)), true, `state must be UNCOMPLETED`);
            assert.equal(callResul.dateIn.eq(dateIn), true, `dateIn must be ${dateIn.toString()}`);
            assert.equal(callResul.dateOut.eq(ZERO), true, `dateOut must be ${ZERO.toString()}`);
            assert.equal(callResul.pauses.length, 0, `pauses must be empty`);
            assert.equal(callResul.comment, "", `comment must be empty`);
        })

        it("should not be possible to add an initial dateIn in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.OTHERS.dateIn);
            
            await expectRevert.unspecified(
                instance.addDateIn(dateRegister, dateIn),
                "COD0"
            );
          
        })

        it("should be possible to change dateIn in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.OTHERS.dateIn);
            
            let txReceipt = await instance.changeDateIn(dateRegister, dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {dateRegister, action: CONST.MODIFIED, dateIn });
        })

        it("should be possible to get the workdayInfo (dateIn, dateOut, pauses, comment and state) of a unregistered day", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.OTHERS.dateIn);

            let callResul = await instance.getWorkday(dateRegister);
           
            assert.equal(callResul.state.eq(new BN(STATES.UNCOMPLETED)), true, `state must be UNCOMPLETED`);
            assert.equal(callResul.dateIn.eq(dateIn), true, `dateIn must be ${dateIn.toString()}`);
            assert.equal(callResul.dateOut.eq(ZERO), true, `dateOut must be ${ZERO.toString()}`);
            assert.equal(callResul.pauses.length, 0, `pauses must be empty`);
            assert.equal(callResul.comment, "", `comment must be empty`);
        })
        
        it("should no be possible to change dateOut before add one in a day´s record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateOut = new BN(WORKDAY_EXAMPLE.dateOut);
            
            await expectRevert.unspecified(
                instance.changeDateOut(dateRegister, dateOut),
                "COD0"
            );
        })

        it("should be possible to add dateOut in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateOut = new BN(WORKDAY_EXAMPLE.dateOut);
            const COMPLETED = new BN(STATES.COMPLETED);
            
            let txReceipt = await instance.addDateOut(dateRegister, dateOut);
    
            expectEvent(txReceipt, 'DateOutEvent', {dateRegister, action: CONST.NEW, dateOut });
            expectEvent(txReceipt, 'WorkdayRecordState', {dateRegister, state: COMPLETED});
        })

        it("should be possible to get the workdayInfo (dateIn, dateOut, pauses, comment and state) of a unregistered day", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.OTHERS.dateIn);
            const dateOut = new BN(WORKDAY_EXAMPLE.dateOut);

            let callResul = await instance.getWorkday(dateRegister);
           
            assert.equal(callResul.state.eq(new BN(STATES.COMPLETED)), true, `state must be COMPLETED`);
            assert.equal(callResul.dateIn.eq(dateIn), true, `dateIn must be ${dateIn.toString()}`);
            assert.equal(callResul.dateOut.eq(dateOut), true, `dateOut must be ${dateOut.toString()}`);
            assert.equal(callResul.pauses.length, 0, `pauses must be empty`);
            assert.equal(callResul.comment, "", `comment must be empty`);
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

        it("should no be posible to add initial dateIn", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.dateIn);
            
            await expectRevert.unspecified(
                instance.addDateIn(dateRegister, dateIn)
            );
        })

        it("should no be posible to add initial dateOut", async () => {
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

            let txReceipt = await instance.changeDateIn(dateRegister, dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {dateRegister, action: CONST.MODIFIED, dateIn });
            expectEvent(txReceipt, 'WorkdayRecordState', {dateRegister, state: MODIFIED});

            let callResul = await instance.getWorkday(dateRegister);
            assert.equal(callResul.state.eq(new BN(STATES.MODIFIED)), true, `state must be MODIFIED`);
            assert.equal(callResul.dateIn.eq(dateIn), true, `dateIn must be ${dateIn.toString()}`);
        })

        it("should be possible to change dateOut in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            dateOut = new BN(WORKDAY_EXAMPLE.OTHERS.dateOut);
            const MODIFIED = new BN(STATES.MODIFIED)

            let txReceipt = await instance.changeDateOut(dateRegister, dateOut);
    
            expectEvent(txReceipt, 'DateOutEvent', {dateRegister, action: CONST.MODIFIED, dateOut });
            expectEvent(txReceipt, 'WorkdayRecordState', {dateRegister, state: MODIFIED});

            let callResul = await instance.getWorkday(dateRegister);
            assert.equal(callResul.state.eq(new BN(STATES.MODIFIED)), true, `state must be MODIFIED`);
            assert.equal(callResul.dateOut.eq(dateOut), true, `dateOut must be ${dateOut.toString()}`);
        })
    })

    describe('MODIFIED STATE', () => {

        before(async() => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.dateIn);
            const dateOut = new BN(WORKDAY_EXAMPLE.dateOut);
            const dateIn2 = new BN(WORKDAY_EXAMPLE.OTHERS.dateIn);

            instance = await WorkdayRecordContract.new();
            await instance.addDateIn(dateRegister, dateIn);
            await instance.addDateOut(dateRegister, dateOut)
            await instance.changeDateIn(dateRegister, dateIn2)
        });

        it("should no be posible to add initial dateIn", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.dateIn);
            
            await expectRevert.unspecified(
                instance.addDateIn(dateRegister, dateIn)
            );
        })

        it("should no be posible to add initial dateOut", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateOut = new BN(WORKDAY_EXAMPLE.dateOut);
            
            await expectRevert.unspecified(
                instance.addDateOut(dateRegister, dateOut)
            );
        })

        it("should be possible to change dateIn in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.OTHERS.dateIn);

            let txReceipt = await instance.changeDateIn(dateRegister, dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {dateRegister, action: CONST.MODIFIED, dateIn });
        })

        it("should be possible to change dateIn in a day's record", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateOut = new BN(WORKDAY_EXAMPLE.OTHERS.dateOut);

            let txReceipt = await instance.changeDateOut(dateRegister, dateOut);
    
            expectEvent(txReceipt, 'DateOutEvent', {dateRegister, action: CONST.MODIFIED, dateOut });
        })

        it("should be possible to get the workdayInfo (dateIn, dateOut, pauses, comment and state) of a unregistered day", async () => {
            const dateRegister = new BN(WORKDAY_EXAMPLE.dateRegister);
            const dateIn = new BN(WORKDAY_EXAMPLE.OTHERS.dateIn);
            const dateOut = new BN(WORKDAY_EXAMPLE.OTHERS.dateOut);

            let callResul = await instance.getWorkday(dateRegister);
           
            assert.equal(callResul.state.eq(new BN(STATES.MODIFIED)), true, `state must be MODIFIED`);
            assert.equal(callResul.dateIn.eq(dateIn), true, `dateIn must be ${dateIn.toString()}`);
            assert.equal(callResul.dateOut.eq(dateOut), true, `dateOut must be ${dateOut.toString()}`);
            assert.equal(callResul.pauses.length, 0, `pauses must be empty`);
            assert.equal(callResul.comment, "", `comment must be empty`);
        })
    })
});