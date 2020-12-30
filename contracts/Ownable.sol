// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

abstract contract Ownable {
    address private _owner;

    constructor() {
        _owner = msg.sender;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(isOwner(), "Ownable:COD0");
        _;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }
}

/* Error String
 ** Ownable:COD0 -> caller is not the owner
 */
