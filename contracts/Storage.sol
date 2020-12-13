// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

contract Storage {
    uint256 public val;

    constructor(uint256 v) {
        val = v;
    }

    function setValue(uint256 v) public {
        val = v;
    }
}
