const WorkdayRecordContract = artifacts.require("WorkdayRecord");

module.exports = function (deployer) {
  deployer.deploy(WorkdayRecordContract);
};
