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
        assert.equal(callResul.state.eq(state), true, `state must be ${state}`);
        assert.equal(callResul.dateIn.eq(dateIn), true, `dateIn must be ${dateIn.toString()}`);
        assert.equal(callResul.dateOut.eq(dateOut), true, `dateOut must be ${dateOut.toString()}`);
        assert.equal(callResul.pauses.length, 0, `pauses must be empty`);
        assert.equal(callResul.comment, "", `comment must be empty`);
    }

    describe('UNREGISTERED STATE', () => {

        beforeEach(async function() {
            instance = await WorkdayRecordContract.new();
        });
        
        it("should not be possible to change an dateIn before add one in a day's record", async () => {      
            await expectRevert.unspecified(
                instance.changeDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn),
                "COD0"
            );
        })

        it("should not be possible to add dateOut in a day's record", async () => {
            await expectRevert.unspecified(
                instance.addDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateOut)
            );
        })

        it("should not be possible to change dateOut in a day's record", async () => {
            await expectRevert.unspecified(
                instance.changeDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateOut)
            );
        })
    
        it("should be possible to add an initial dateIn in a day's record", async () => {
            let txReceipt = await instance.addDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.NEW, 
                dateIn: WORKDAY_EXAMPLE.dateIn 
            });
            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.UNCOMPLETED
            });
        })

        it("should be possible to get workdayInfo", async () => {
            let txReceipt, callResul;
            
            txReceipt = await instance.addDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn);
    
            callResul = await instance.getWorkday(WORKDAY_EXAMPLE.dateRegister);
            checkWorkdayInfo(callResul, STATES.UNCOMPLETED, WORKDAY_EXAMPLE.dateIn, ZERO, null, null);
        })
    });
    
    describe('UNCOMPLETED STATE', () => {

        beforeEach(async function() {
            instance = await WorkdayRecordContract.new();
            await instance.addDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn);
        });

        it("should not be possible to add an initial dateIn in a day's record", async () => {         
            await expectRevert.unspecified(
                instance.addDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn),
                "COD0"
            );
        })
        
        it("should not be possible to change dateOut before add one in a day´s record", async () => {
            await expectRevert.unspecified(
                instance.changeDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateOut),
                "COD0"
            );
        })

        it("should be possible to change dateIn in a day's record", async () => {     
            let txReceipt = await instance.changeDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.MODIFIED, 
                dateIn: WORKDAY_EXAMPLE.OTHERS.dateIn 
            });
        })

        it("should be possible to add dateOut in a day's record", async () => { 
            let txReceipt = await instance.addDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateOut);
    
            expectEvent(txReceipt, 'DateOutEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.NEW, 
                dateOut: WORKDAY_EXAMPLE.dateOut
             });
            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister:WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.COMPLETED
            });
        })

        it('should be posible to get workdayInfo', async () => {
            await instance.changeDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.dateIn);
            await instance.addDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateOut);

            let callResul = await instance.getWorkday(WORKDAY_EXAMPLE.dateRegister);
            checkWorkdayInfo(callResul, 
                STATES.COMPLETED, 
                WORKDAY_EXAMPLE.OTHERS.dateIn, 
                WORKDAY_EXAMPLE.dateOut, 
                null, 
                null
            );
        })
    });

    describe('COMPLETED STATE', () => {

        beforeEach(async() => {
            instance = await WorkdayRecordContract.new();
            await instance.addDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn);
            await instance.addDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateOut)
        });

        it("should not be posible to add initial dateIn", async () => {
            await expectRevert.unspecified(
                instance.addDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn)
            );
        })

        it("should not be posible to add initial dateOut", async () => {
            await expectRevert.unspecified(
                instance.addDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateOut)
            );
        })

        it("should be possible to change dateIn in a day's record", async () => {
            let txReceipt = await instance.changeDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.MODIFIED, 
                dateIn: WORKDAY_EXAMPLE.OTHERS.dateIn 
            });
            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.MODIFIED
            });
        })

        it("should be possible to change dateOut in a day's record", async () => {
            let txReceipt = await instance.changeDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.dateOut);
    
            expectEvent(txReceipt, 'DateOutEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.MODIFIED, 
                dateOut: WORKDAY_EXAMPLE.OTHERS.dateOut 
            });
            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.MODIFIED
            });
        })

        it('should be possible to get workdayInfo', async () => {
            await instance.changeDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.dateIn);
            await instance.changeDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.dateOut);

            let callResul = await instance.getWorkday(WORKDAY_EXAMPLE.dateRegister);
            checkWorkdayInfo(callResul, 
                STATES.MODIFIED, 
                WORKDAY_EXAMPLE.OTHERS.dateIn, 
                WORKDAY_EXAMPLE.OTHERS.dateOut, 
                null, 
                null
            );
        })
    })

    describe.only('MODIFIED STATE', () => {

        beforeEach(async() => {
            instance = await WorkdayRecordContract.new();
            await instance.addDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn);
            await instance.addDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateOut)
            await instance.changeDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn)
        });

        it("should not be posible to add initial dateIn", async () => {
            await expectRevert.unspecified(
                instance.addDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn)
            );
        })

        it("should not be posible to add initial dateOut", async () => {
            await expectRevert.unspecified(
                instance.addDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateOut)
            );
        })

        it("should be possible to change dateIn in a day's record", async () => {
            let txReceipt = await instance.changeDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.MODIFIED, 
                dateIn: WORKDAY_EXAMPLE.OTHERS.dateIn 
            });
        })

        it("should be possible to change dateOut in a day's record", async () => {
            let txReceipt = await instance.changeDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.dateOut);
    
            expectEvent(txReceipt, 'DateOutEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.MODIFIED, 
                dateOut: WORKDAY_EXAMPLE.OTHERS.dateOut 
            });
        })

        it('should be possible to get workdayInfo', async () => {
            await instance.changeDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.dateIn);
            await instance.changeDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.dateOut);

            let callResul = await instance.getWorkday(WORKDAY_EXAMPLE.dateRegister);
            checkWorkdayInfo(callResul, 
                STATES.MODIFIED, 
                WORKDAY_EXAMPLE.OTHERS.dateIn, 
                WORKDAY_EXAMPLE.OTHERS.dateOut, 
                null, 
                null
            );
        })
    })
});