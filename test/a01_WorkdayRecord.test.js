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

        if(pauses){
            callResul.pauses.forEach( (pause, i) => {
                assert.equal(pause.eq(pauses[i]), true, `pause ${i} must be ${pauses[i].toString}`) 
            });
        }else{
            assert.equal(callResul.pauses.length, 0, `pauses must be empty`)
        }
        
        if(comment){
            assert.equal(callResul.comment, comment, `comment must be ${comment}`);
        }
        else {
            assert.equal(callResul.comment, "", `comment must be empty`);
        }
    }

    describe('UNREGISTERED STATE', () => {

        beforeEach(async function() {
            instance = await WorkdayRecordContract.new();
        });

        it("should not be possible to add dateOut in a day's record", async () => {
            await expectRevert.unspecified(
                instance.setDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateOut)
            );
        })

        it("should not be possible to add comment", async () => {
            await expectRevert.unspecified(
                instance.addComment(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.comment)
            );
        })

        it('should not be possible to add a pause', async () => {
            await expectRevert.unspecified(
                instance.addPauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.addPauses),
                'COD0'
            )
        })

        it('should not be possible to remove a pause', async () => {
            await expectRevert.unspecified(
                instance.removePauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.removePauses),
                'COD0'
            )
        })
    
        it("should be possible to add an initial dateIn in a day's record", async () => {
            let txReceipt = await instance.setDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                dateIn: WORKDAY_EXAMPLE.dateIn 
            });
            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.UNCOMPLETED
            });
        })

        it("should be possible to get workdayInfo", async () => {
            let txReceipt, callResul;
            
            txReceipt = await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.dateIn,
                ZERO,
                [],
                [],
                ""
            );
    
            callResul = await instance.getWorkday(WORKDAY_EXAMPLE.dateRegister);
            checkWorkdayInfo(callResul, STATES.UNCOMPLETED, WORKDAY_EXAMPLE.dateIn, ZERO, null, null);
        })
    });
    
    describe('UNCOMPLETED STATE', () => {

        beforeEach(async function() {
            instance = await WorkdayRecordContract.new();
            await instance.setDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn);
        });
        

        it("should not be possible to add comment", async () => {
            await expectRevert.unspecified(
                instance.addComment(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.comment)
            );
        })

        it("should be possible to change dateIn in a day's record", async () => {     
            let txReceipt = await instance.setDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                dateIn: WORKDAY_EXAMPLE.OTHERS.dateIn 
            });
        })

        it("should be possible to add dateOut in a day's record", async () => { 
            let txReceipt = await instance.setDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateOut);
    
            expectEvent(txReceipt, 'DateOutEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                dateOut: WORKDAY_EXAMPLE.dateOut
             });
            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister:WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.COMPLETED
            });
        })

        it('should be possible to add a pause', async () => {
            let txReceipt = await instance.addPauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.addPauses);
            expectEvent(txReceipt, 'PauseEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.ADD, 
                dateIn: WORKDAY_EXAMPLE.addPauses[0],
                dateOut: WORKDAY_EXAMPLE.addPauses[1]
             });
        })

        it('should be possible to remove a pause', async () => {
            await instance.addPauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.addPauses);
            let txReceipt = await instance.removePauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.removePauses);

            expectEvent(txReceipt, 'PauseEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.REMOVE, 
                dateIn: WORKDAY_EXAMPLE.removePauses[0],
                dateOut: WORKDAY_EXAMPLE.removePauses[1]
             });
        })

        it('should be posible to get workdayInfo', async () => {
            await instance.record(
                WORKDAY_EXAMPLE.dateRegister,
                WORKDAY_EXAMPLE.OTHERS.dateIn,
                WORKDAY_EXAMPLE.dateOut,
                WORKDAY_EXAMPLE.addPauses,
                WORKDAY_EXAMPLE.removePauses,
                ""
            );

            let callResul = await instance.getWorkday(WORKDAY_EXAMPLE.dateRegister);
            checkWorkdayInfo(callResul, 
                STATES.COMPLETED, 
                WORKDAY_EXAMPLE.OTHERS.dateIn, 
                WORKDAY_EXAMPLE.dateOut, 
                WORKDAY_EXAMPLE.pauses, 
                null
            );
        })
    });

    describe('COMPLETED STATE', () => {

        beforeEach(async() => {
            instance = await WorkdayRecordContract.new();
            await instance.setDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn);
            await instance.setDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateOut)
        });

        it("should not be possible to add comment", async () => {
            await expectRevert.unspecified(
                instance.addComment(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.comment)
            );
        })

        it('should not be possible to add more than three pause', async () => {
            instance.addPauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.pause1);
            instance.addPauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.pause2);
            instance.addPauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.pause3);
            await expectRevert.unspecified(
                instance.addPauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.pause4),
                'COD2'
            )
        })

        it('should not be possible to add a pause with odd length', async () => {
            await expectRevert.unspecified(
                instance.addPauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.pauseOddLength),
                'COD2'
            )
        })

        it('should not be possible to remove a pause before add a pause', async () => {
            await expectRevert.unspecified(
                instance.removePauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.removePauses),
                'COD6'
            );
        })

        it('should not be possible to remove a pause with odd length', async () => {
            await instance.addPauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.addPauses);
            await expectRevert.unspecified(
                instance.removePauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.pauseOddLength),
                'COD1'
            )
        })

        it('should not be possible to remove more pauses than exists', async () => {
            await instance.addPauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.pause1);
            await expectRevert.unspecified(
                instance.removePauses(WORKDAY_EXAMPLE.dateRegister,[
                    ...WORKDAY_EXAMPLE.OTHERS.pause1,
                    ...WORKDAY_EXAMPLE.OTHERS.pause2
                ]),
                'COD5'
            )
        })

        it('should not be possible to remove a pause that dont exist', async () => {
            await instance.addPauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.pause1);
            await expectRevert.unspecified(
                instance.removePauses(WORKDAY_EXAMPLE.dateRegister,WORKDAY_EXAMPLE.OTHERS.pause2),
                'COD3'
            )
        })

        it("should be possible to change dateIn in a day's record", async () => {
            let txReceipt = await instance.setDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                dateIn: WORKDAY_EXAMPLE.OTHERS.dateIn 
            });
            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.MODIFIED
            });
        })

        it("should be possible to change dateOut in a day's record", async () => {
            let txReceipt = await instance.setDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.dateOut);
    
            expectEvent(txReceipt, 'DateOutEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                dateOut: WORKDAY_EXAMPLE.OTHERS.dateOut 
            });
            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.MODIFIED
            });
        })

        it('should be possible to add a pause', async () => {
            let txReceipt = await instance.addPauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.addPauses);
            expectEvent(txReceipt, 'PauseEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.ADD, 
                dateIn: WORKDAY_EXAMPLE.addPauses[0],
                dateOut: WORKDAY_EXAMPLE.addPauses[1]
             });

            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.MODIFIED
            });
        })

        it('should be possible to remove a pause', async () => {
            instance = await WorkdayRecordContract.new();
            await instance.setDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn);
            await instance.addPauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.addPauses);
            await instance.setDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateOut)
            
            let txReceipt = await instance.removePauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.removePauses);
            expectEvent(txReceipt, 'PauseEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.REMOVE, 
                dateIn: WORKDAY_EXAMPLE.removePauses[0],
                dateOut: WORKDAY_EXAMPLE.removePauses[1]
             });

            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.MODIFIED
            });
        })

        it('should be possible to get workdayInfo', async () => {
            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.OTHERS.dateIn,
                WORKDAY_EXAMPLE.OTHERS.dateOut,
                WORKDAY_EXAMPLE.addPauses,
                WORKDAY_EXAMPLE.removePauses,
                ""
            );

            let callResul = await instance.getWorkday(WORKDAY_EXAMPLE.dateRegister);
            checkWorkdayInfo(callResul, 
                STATES.MODIFIED, 
                WORKDAY_EXAMPLE.OTHERS.dateIn, 
                WORKDAY_EXAMPLE.OTHERS.dateOut, 
                WORKDAY_EXAMPLE.pauses, 
                null
            );
        })
    })

    describe('MODIFIED STATE', () => {

        beforeEach(async() => {
            instance = await WorkdayRecordContract.new();
            await instance.setDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn);
            await instance.setDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateOut)
            await instance.setDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.dateIn)
        });

        it("should be possible to change dateIn in a day's record", async () => {
            let txReceipt = await instance.setDateIn(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.dateIn);
    
            expectEvent(txReceipt, 'DateInEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                dateIn: WORKDAY_EXAMPLE.OTHERS.dateIn 
            });
        })

        it("should be possible to change dateOut in a day's record", async () => {
            let txReceipt = await instance.setDateOut(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.OTHERS.dateOut);
    
            expectEvent(txReceipt, 'DateOutEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                dateOut: WORKDAY_EXAMPLE.OTHERS.dateOut 
            });
        })

        it("should be possible to add comment", async () => {
           await instance.addComment(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.comment);
        })

        it('should be possible to add a pause', async () => {
            let txReceipt = await instance.addPauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.addPauses);
            expectEvent(txReceipt, 'PauseEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.ADD, 
                dateIn: WORKDAY_EXAMPLE.addPauses[0],
                dateOut: WORKDAY_EXAMPLE.addPauses[1]
             });
        })

        it('it should be possible to remove a pause', async () => {
            await instance.addPauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.addPauses);
            let txReceipt = await instance.removePauses(WORKDAY_EXAMPLE.dateRegister, WORKDAY_EXAMPLE.removePauses);

            expectEvent(txReceipt, 'PauseEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.REMOVE, 
                dateIn: WORKDAY_EXAMPLE.removePauses[0],
                dateOut: WORKDAY_EXAMPLE.removePauses[1]
             });
        })

        it('should be possible to get workdayInfo', async () => {
            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.OTHERS.dateIn,
                WORKDAY_EXAMPLE.OTHERS.dateOut,
                WORKDAY_EXAMPLE.addPauses,
                WORKDAY_EXAMPLE.removePauses,
                WORKDAY_EXAMPLE.comment
            );

            let callResul = await instance.getWorkday(WORKDAY_EXAMPLE.dateRegister);
            checkWorkdayInfo(callResul, 
                STATES.MODIFIED, 
                WORKDAY_EXAMPLE.OTHERS.dateIn, 
                WORKDAY_EXAMPLE.OTHERS.dateOut, 
                WORKDAY_EXAMPLE.pauses, 
                WORKDAY_EXAMPLE.comment
            );
        })
    })
});