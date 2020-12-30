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
        WORKDAY_EXAMPLE_2
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
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    ZERO,
                    WORKDAY_EXAMPLE.dateOut,
                    [],
                    [],
                    ""
                )
            );
        })

        it("should not be possible to add comment", async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    ZERO,
                    ZERO,
                    [],
                    [],
                    WORKDAY_EXAMPLE.comment
                )
            );
        })

        it('should not be possible to add a pause', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    ZERO,
                    ZERO,
                    WORKDAY_EXAMPLE.addPauses,
                    [],
                    ""
                ),
                'COD0'
            )
        })

        it('should not be possible to remove a pause', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    ZERO,
                    ZERO,
                    [],
                    WORKDAY_EXAMPLE.removePauses,
                    ""
                ),
                'COD0'
            )
        })
    
        it("should be possible to add an initial dateIn in a day's record", async () => {
            let txReceipt = await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.dateIn,
                ZERO,
                [],
                [],
                ""
            );
    
            expectEvent(txReceipt, 'DateInEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                dateIn: WORKDAY_EXAMPLE.dateIn,
                state: STATES.UNREGISTERED
            });
            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.UNCOMPLETED
            });
        })

        it("should be possible to get workdayInfo", async () => {        
            let txReceipt = await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.dateIn,
                ZERO,
                [],
                [],
                ""
            );

            expectEvent(txReceipt, 'WorkdayRecordEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister,
                dateIn:  WORKDAY_EXAMPLE.dateIn,
                pauses: [], 
                dateOut:  ZERO, 
                comment: "",
                state: STATES.UNCOMPLETED
            });
    
            let callResul = await instance.getWorkday(WORKDAY_EXAMPLE.dateRegister);
            checkWorkdayInfo(callResul, STATES.UNCOMPLETED, WORKDAY_EXAMPLE.dateIn, ZERO, null, null);
        })
    });
    
    describe('UNCOMPLETED STATE', () => {

        beforeEach(async function() {
            instance = await WorkdayRecordContract.new();
            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.dateIn,
                ZERO,
                [],
                [],
                ""
            )
        });
        

        it("should not be possible to add comment", async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    ZERO,
                    ZERO,
                    [],
                    [],
                    WORKDAY_EXAMPLE.comment
                )
            );
        })

        it("should be possible to change dateIn in a day's record", async () => {     
            let txReceipt = await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.OTHERS.dateIn,
                ZERO,
                [],
                [],
                ""
            );
    
            expectEvent(txReceipt, 'DateInEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                dateIn: WORKDAY_EXAMPLE.OTHERS.dateIn,
                state: STATES.UNCOMPLETED
            });
        })

        it("should be possible to add dateOut in a day's record", async () => { 
            let txReceipt = await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                WORKDAY_EXAMPLE.dateOut,
                [],
                [],
                ""
            );
    
            expectEvent(txReceipt, 'DateOutEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                dateOut: WORKDAY_EXAMPLE.dateOut,
                state: STATES.UNCOMPLETED
             });
            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister:WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.COMPLETED
            });
        })

        it('should be possible to add a pause', async () => {
            let txReceipt = await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                ZERO,
                WORKDAY_EXAMPLE.addPauses,
                [],
                ""
            );

            expectEvent(txReceipt, 'PauseEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.ADD, 
                dateIn: WORKDAY_EXAMPLE.addPauses[0],
                dateOut: WORKDAY_EXAMPLE.addPauses[1],
                state: STATES.UNCOMPLETED
             });
        })

        it('should be possible to remove a pause', async () => {
            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                ZERO,
                WORKDAY_EXAMPLE.addPauses,
                [],
                ""
            );

            let txReceipt = await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                ZERO,
                [],
                WORKDAY_EXAMPLE.removePauses,
                ""
            );

            expectEvent(txReceipt, 'PauseEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.REMOVE, 
                dateIn: WORKDAY_EXAMPLE.removePauses[0],
                dateOut: WORKDAY_EXAMPLE.removePauses[1],
                state: STATES.UNCOMPLETED
             });
        })

        it('should be posible to get workdayInfo', async () => {
            let txReceipt = await instance.record(
                WORKDAY_EXAMPLE.dateRegister,
                WORKDAY_EXAMPLE.OTHERS.dateIn,
                WORKDAY_EXAMPLE.dateOut,
                WORKDAY_EXAMPLE.addPauses,
                WORKDAY_EXAMPLE.removePauses,
                ""
            );

            expectEvent(txReceipt, 'WorkdayRecordEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister,
                dateIn:  WORKDAY_EXAMPLE.OTHERS.dateIn,
                //pauses: WORKDAY_EXAMPLE.pauses, 
                dateOut:  WORKDAY_EXAMPLE.dateOut, 
                comment: "",
                state: STATES.COMPLETED
            });

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
            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.dateIn,
                WORKDAY_EXAMPLE.dateOut,
                [],
                [],
                ""
            )
        });

        it("should not be possible to add comment", async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    ZERO,
                    ZERO,
                    [],
                    [],
                    WORKDAY_EXAMPLE.comment
                )
            );
        })

        it('should not be possible to add more than three pause', async () => {
            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                ZERO,
                WORKDAY_EXAMPLE.OTHERS.pause1,
                [],
                ""
            )

            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                ZERO,
                WORKDAY_EXAMPLE.OTHERS.pause2,
                [],
                ""
            )

            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                ZERO,
                WORKDAY_EXAMPLE.OTHERS.pause3,
                [],
                ""
            )
           
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    ZERO,
                    ZERO,
                    WORKDAY_EXAMPLE.OTHERS.pause4,
                    [],
                    ""
                ),
                'COD2'
            )
        })

        it('should not be possible to add a pause with odd length', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    ZERO,
                    ZERO,
                    WORKDAY_EXAMPLE.OTHERS.pauseOddLength,
                    [],
                    ""
                ),
                'COD2'
            )
        })

        it('should not be possible to remove a pause before add a pause', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    ZERO,
                    ZERO,
                    [],
                    WORKDAY_EXAMPLE.removePauses,
                    ""
                ),
                'COD6'
            );
        })

        it('should not be possible to remove a pause with odd length', async () => {
            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                ZERO,
                WORKDAY_EXAMPLE.addPauses,
                [],
                ""
            );

            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    ZERO,
                    ZERO,
                    [],
                    WORKDAY_EXAMPLE.OTHERS.pauseOddLength,
                    ""
                ),
                'COD1'
            )
        })

        it('should not be possible to remove more pauses than exists', async () => {
            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                ZERO,
                WORKDAY_EXAMPLE.OTHERS.pause1,
                [],
                ""
            );
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    ZERO,
                    ZERO,
                    WORKDAY_EXAMPLE.OTHERS.pause1,
                    [
                        ...WORKDAY_EXAMPLE.OTHERS.pause1,
                        ...WORKDAY_EXAMPLE.OTHERS.pause2
                    ],
                    ""
                ),
                'COD5'
            )
        })

        it('should not be possible to remove a pause that dont exist', async () => {
            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                ZERO,
                WORKDAY_EXAMPLE.OTHERS.pause1,
                [],
                ""
            );
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    ZERO,
                    ZERO,
                    [],
                    WORKDAY_EXAMPLE.OTHERS.pause2,
                    ""
                ),
                'COD3'
            )
        })

        it("should be possible to change dateIn in a day's record", async () => {
            let txReceipt =  await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.OTHERS.dateIn,
                ZERO,
                [],
                [],
                ""
            );
    
            expectEvent(txReceipt, 'DateInEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                dateIn: WORKDAY_EXAMPLE.OTHERS.dateIn,
                state: STATES.COMPLETED
            });
            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.MODIFIED
            });
        })

        it("should be possible to change dateOut in a day's record", async () => {
            let txReceipt =  await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                WORKDAY_EXAMPLE.OTHERS.dateOut,
                [],
                [],
                ""
            );
    
            expectEvent(txReceipt, 'DateOutEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                dateOut: WORKDAY_EXAMPLE.OTHERS.dateOut,
                state: STATES.COMPLETED
            });
            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.MODIFIED
            });
        })

        it('should be possible to add a pause', async () => {
            let txReceipt =  await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                ZERO,
                WORKDAY_EXAMPLE.addPauses,
                [],
                ""
            );

            expectEvent(txReceipt, 'PauseEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.ADD, 
                dateIn: WORKDAY_EXAMPLE.addPauses[0],
                dateOut: WORKDAY_EXAMPLE.addPauses[1],
                state: STATES.COMPLETED
             });

            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.MODIFIED
            });
        })

        it('should be possible to remove a pause', async () => {
            instance = await WorkdayRecordContract.new();
            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.dateIn,
                WORKDAY_EXAMPLE.dateOut,
                WORKDAY_EXAMPLE.addPauses,
                [],
                ""
            );
            
            let txReceipt = await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                ZERO,
                [],
                WORKDAY_EXAMPLE.removePauses,
                ""
            );

            expectEvent(txReceipt, 'PauseEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.REMOVE, 
                dateIn: WORKDAY_EXAMPLE.removePauses[0],
                dateOut: WORKDAY_EXAMPLE.removePauses[1],
                state: STATES.COMPLETED
             });

            expectEvent(txReceipt, 'WorkdayRecordState', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                state: STATES.MODIFIED
            });
        })

        it('should be possible to get workdayInfo', async () => {
            let txReceipt = await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.OTHERS.dateIn,
                WORKDAY_EXAMPLE.OTHERS.dateOut,
                WORKDAY_EXAMPLE.addPauses,
                WORKDAY_EXAMPLE.removePauses,
                ""
            );

            expectEvent(txReceipt, 'WorkdayRecordEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister,
                dateIn:  WORKDAY_EXAMPLE.OTHERS.dateIn,
                //pauses: WORKDAY_EXAMPLE.pauses, 
                dateOut:  WORKDAY_EXAMPLE.OTHERS.dateOut, 
                comment: "",
                state: STATES.MODIFIED
            });


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
            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.dateIn,
                WORKDAY_EXAMPLE.dateOut,
                [],
                [],
                ""
            ),

            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.dateIn,
                ZERO,
                [],
                [],
                ""
            )
            
        });

        it("should be possible to change dateIn in a day's record", async () => {
            let txReceipt = await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.OTHERS.dateIn,
                ZERO,
                [],
                [],
                ""
            )

            expectEvent(txReceipt, 'DateInEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                dateIn: WORKDAY_EXAMPLE.OTHERS.dateIn,
                state: STATES.MODIFIED
            });
        })

        it("should be possible to change dateOut in a day's record", async () => {
            let txReceipt = await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                WORKDAY_EXAMPLE.OTHERS.dateOut,
                [],
                [],
                ""
            )
    
            expectEvent(txReceipt, 'DateOutEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                dateOut: WORKDAY_EXAMPLE.OTHERS.dateOut,
                state: STATES.MODIFIED
            });
        })

        it("should be possible to add comment", async () => {
           await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                ZERO,
                [],
                [],
                WORKDAY_EXAMPLE.comment
            )
        })

        it('should be possible to add a pause', async () => {
            let txReceipt = await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                ZERO,
                WORKDAY_EXAMPLE.addPauses,
                [],
                ""
            )
        
            expectEvent(txReceipt, 'PauseEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.ADD, 
                dateIn: WORKDAY_EXAMPLE.addPauses[0],
                dateOut: WORKDAY_EXAMPLE.addPauses[1],
                state: STATES.MODIFIED
             });
        })

        it('it should be possible to remove a pause', async () => {
            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                ZERO,
                WORKDAY_EXAMPLE.addPauses,
                [],
                ""
            )
            let txReceipt = await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                ZERO,
                ZERO,
                [],
                WORKDAY_EXAMPLE.removePauses,
                ""
            )

            expectEvent(txReceipt, 'PauseEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister, 
                action: CONST.REMOVE, 
                dateIn: WORKDAY_EXAMPLE.removePauses[0],
                dateOut: WORKDAY_EXAMPLE.removePauses[1],
                state: STATES.MODIFIED
             });
        })

        it('should be possible to get workdayInfo', async () => {
            let txReceipt = await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.OTHERS.dateIn,
                WORKDAY_EXAMPLE.OTHERS.dateOut,
                WORKDAY_EXAMPLE.addPauses,
                WORKDAY_EXAMPLE.removePauses,
                WORKDAY_EXAMPLE.comment
            );

            expectEvent(txReceipt, 'WorkdayRecordEvent', {
                dateRegister: WORKDAY_EXAMPLE.dateRegister,
                dateIn:  WORKDAY_EXAMPLE.OTHERS.dateIn,
                //pauses: WORKDAY_EXAMPLE.pauses, 
                dateOut:  WORKDAY_EXAMPLE.OTHERS.dateOut, 
                comment: WORKDAY_EXAMPLE.comment,
                state: STATES.MODIFIED
            });

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

    describe('ACCESS CONTROL', () => {
        const [owner, other] = accounts;

        beforeEach(async () => {
            instance = await WorkdayRecordContract.new({from: owner});
        });

        it('should not be posible to add workdayInfo if transaction doesn´t come from owner', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    WORKDAY_EXAMPLE.dateIn,
                    WORKDAY_EXAMPLE.dateOut,
                    WORKDAY_EXAMPLE.pauses,
                    [],
                    WORKDAY_EXAMPLE.comment, 
                    {from: other}
                ),
                "Ownable: caller is not the owner"
            )
        });

        it('should be posible to get workdayInfo by other person than owner', async () => {
            await instance.record(
                WORKDAY_EXAMPLE.dateRegister, 
                WORKDAY_EXAMPLE.dateIn,
                WORKDAY_EXAMPLE.dateOut,
                WORKDAY_EXAMPLE.pauses,
                [],
                "", 
                {from: owner}
            );

            let callResul = await instance.getWorkday(WORKDAY_EXAMPLE.dateRegister, {from: other});
            checkWorkdayInfo(callResul, 
                STATES.COMPLETED, 
                WORKDAY_EXAMPLE.dateIn, 
                WORKDAY_EXAMPLE.dateOut, 
                WORKDAY_EXAMPLE.pauses, 
                null
            );
        });
    })

    describe('UNIX TIMESTAMP', () => {

        beforeEach(async () => {
            instance = await WorkdayRecordContract.new();
        });

        it('should not be posible to add workdayInfo if dateRegisteris not at midnight', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.OTHERS.invalidDateRegister, 
                    ZERO,
                    ZERO,
                    [],
                    [],
                    "" 
                ),
                "COD20"
            )
        });

        it('should not be posible to add workdayInfo if dates timestamp are not sorted (1)', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    WORKDAY_EXAMPLE.dateOut,
                    WORKDAY_EXAMPLE.dateIn,
                    [],
                    [],
                    "" 
                ),
                "COD40"
            )
        });

        it('should not be posible to add workdayInfo if dates timestamp are not sorted (2)', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    WORKDAY_EXAMPLE.dateIn,
                    WORKDAY_EXAMPLE.OTHERS.pause1[0],
                    [WORKDAY_EXAMPLE.OTHERS.dateOut],
                    [],
                    "" 
                ),
                "COD40"
            )
        });

        it('should not be posible to add workdayInfo if dates timestamp are not sorted (3)', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    WORKDAY_EXAMPLE.dateIn,
                    WORKDAY_EXAMPLE.OTHERS.dateOut,
                    [
                        ...WORKDAY_EXAMPLE.OTHERS.pause2, 
                        ...WORKDAY_EXAMPLE.OTHERS.pause1
                    ],
                    [],
                    "" 
                ),
                "COD40"
            )
        });

        it('should not be posible to add workdayInfo if dates timestamp are not sorted (4)', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    WORKDAY_EXAMPLE.dateIn,
                    WORKDAY_EXAMPLE.OTHERS.dateOut,
                    WORKDAY_EXAMPLE.OTHERS.unsortedPause,
                    [],
                    "" 
                ),
                "COD40"
            )
        });

        it('should not be posible to add workdayInfo if dates timestamp are equals (1)', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    WORKDAY_EXAMPLE.dateIn,
                    WORKDAY_EXAMPLE.dateIn,
                    [],
                    "" 
                ),
                "COD40"
            )
        });

        it('should not be posible to add workdayInfo if dates timestamp are equals (2)', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    WORKDAY_EXAMPLE.dateIn,
                    WORKDAY_EXAMPLE.dateOut,
                    [
                        ...WORKDAY_EXAMPLE.OTHERS.pause1,
                        ...WORKDAY_EXAMPLE.OTHERS.pause1
                    ],
                    "" 
                ),
                "COD40"
            )
        });

        it('should not be posible to add workdayInfo if dates timestamp are not from same date (1)', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    WORKDAY_EXAMPLE_2.dateIn,
                    ZERO,
                    [],
                    [],
                    "" 
                ),
                "COD30"
            )
        });

        it('should not be posible to add workdayInfo if dates timestamp are not from same date (2)', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    WORKDAY_EXAMPLE.dateIn,
                    WORKDAY_EXAMPLE_2.dateOut,
                    [],
                    [],
                    "" 
                ),
                "COD30"
            )
        });

        it('should not be posible to add workdayInfo if dates timestamp are not from same date (3)', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    WORKDAY_EXAMPLE.dateIn,
                    WORKDAY_EXAMPLE.dateOut,
                    WORKDAY_EXAMPLE_2.pauses,
                    [],
                    "" 
                ),
                "COD30"
            )
        });

        it('should not be posible to add workdayInfo if dates timestamp are not from same date (4)', async () => {
            await expectRevert.unspecified(
                instance.record(
                    WORKDAY_EXAMPLE.dateRegister, 
                    WORKDAY_EXAMPLE.dateIn,
                    WORKDAY_EXAMPLE.dateOut,
                    [
                        ...WORKDAY_EXAMPLE.OTHERS.pause1,
                        ...WORKDAY_EXAMPLE_2.OTHERS.pause1
                    ],
                    [],
                    "" 
                ),
                "COD30"
            )
        });
    });

});