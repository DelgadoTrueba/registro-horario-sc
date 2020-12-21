// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

contract Storage {
    uint256 public val;

    function setValue(uint256 v) public {
        val = v;
    }

    function getValue() public view returns (uint256) {
        return val;
    }
}
