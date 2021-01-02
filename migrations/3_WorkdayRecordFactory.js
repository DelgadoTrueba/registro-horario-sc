const WorkdayRecordFactoryContract = artifacts.require("WorkdayRecordFactory");

module.exports = function (deployer) {
  deployer.deploy(WorkdayRecordFactoryContract);
};
