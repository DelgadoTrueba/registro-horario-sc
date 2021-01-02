/**********************************************************************/// SMART CONTRACTS
const WorkdayRecordControllerContract = artifacts.require("WorkdayRecordController");
const WorkdayRecordFactoryContract = artifacts.require("WorkdayRecordFactory");
/**********************************************************************/// CONSTANTS
const {
    BN,
    expectEvent,
    expectRevert  
} = require('@openzeppelin/test-helpers');
const { assertion } = require('@openzeppelin/test-helpers/src/expectRevert');
const ZERO = new BN(0);

let instance;

contract("WorkdayRecordController Contract:", (accounts) => {

    const [admin] = accounts;
    const numEmployee = new BN(1);

    beforeEach(async function() {
        instance = await WorkdayRecordControllerContract.new(WorkdayRecordFactoryContract.address);        
    });

    it("should be posible to create a workdayRecord contract and associate an employee number", async () => {
        let txReceipt = await instance.createWorkdayRecord(numEmployee, {from: admin});

        expectEvent(txReceipt, "NewWorkdayRecord", {
            numEmployee: numEmployee
        });
    });
    
    it("should not be posible to create a workdayRecord contract and associate an existing employee number", async () => {
        await instance.createWorkdayRecord(numEmployee, {from: admin});

        expectRevert.unspecified(
            instance.createWorkdayRecord(numEmployee, {from: admin}),
            "WorkdayRecordController:COD0"
        );
    });

    it("should be posible to get a workdayRecord contract by employee number", async () => {
        let txReceipt = await instance.createWorkdayRecord(numEmployee, {from: admin});

        let callResul = await instance.getWorkdayRecord(numEmployee);
        
        assert.equal(callResul, txReceipt.logs[0].args[1])
    });

})