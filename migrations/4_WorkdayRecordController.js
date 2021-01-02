const WorkdayRecordFactoryContract = artifacts.require("WorkdayRecordFactory");
const WorkdayRecordControllerContract = artifacts.require("WorkdayRecordController");

module.exports = function (deployer) {
  deployer.deploy(WorkdayRecordControllerContract, WorkdayRecordFactoryContract.address);
};
