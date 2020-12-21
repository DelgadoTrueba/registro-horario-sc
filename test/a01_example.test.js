/**********************************************************************/// SMART CONTRACTS
const StorageContract = artifacts.require("Storage");
/**********************************************************************/// CONSTANTS
const StorageValues = require('./storage_values')
const toBN = web3.utils.toBN; 

contract("Storage Controller:", (accounts) => {

    const { 
        value
    } = StorageValues;

    let instance;

    beforeEach(async function() {
        instance = await StorageContract.new();
    });

    it("should be possible to set a value", async () => {
        await instance.setValue(toBN(value));
    })

    it("should be possible to get the value", async () => {
        await instance.setValue(toBN(value));
        let callResul = await instance.getValue();
       
        assert.equal(callResul.eq(toBN(value)), true, `Value must be ${callResul}`);
    })
});