// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

abstract contract Factory {
    function create() public virtual returns (address);

    function getContracts() public view virtual returns (address[] memory);
}
