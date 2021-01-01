/**********************************************************************/// SMART CONTRACTS
const WorkdayRecordFactoryContract = artifacts.require("WorkdayRecordFactory");
const WorkdayRecordContract = artifacts.require("WorkdayRecord");
/**********************************************************************/// CONSTANTS
const {
    BN,
    expectEvent,
    expectRevert  
} = require('@openzeppelin/test-helpers');
const { assertion } = require('@openzeppelin/test-helpers/src/expectRevert');
const ZERO = new BN(0);

let instance;

contract("WorkdayRecordFactory Contract:", (accounts) => {

    beforeEach(async function() {
        instance = await WorkdayRecordFactoryContract.new();        
    });

    it("should be possible to deploy a WorkdayRecord contract", async () => {
        await instance.create();
    })

    it("should be possible to get all deployed WorkdayRecord contracts", async () => {
        await instance.create();
        await instance.create();
        await instance.create();

        let callResul = await instance.getContracts();
        assert.equal(callResul.length, 3, "Invalid workdayRecordAddress array length")
    })

});