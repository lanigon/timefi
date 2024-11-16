// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IProjectImplementation {
    function checkUpkeep() external view returns (bool upkeepNeeded, uint256[] memory loanIdsToRepay);
    function performUpkeep(uint256[] memory loanIdsToRepay) external;
}

contract RepaymentManager is Ownable {
    IProjectImplementation public projectImplementation;

    event UpkeepPerformed(uint256[] loanIdsRepaid);

    constructor(address _projectImplementation) Ownable(msg.sender) {
        require(_projectImplementation != address(0), "Invalid ProjectImplementation address");
        projectImplementation = IProjectImplementation(_projectImplementation);
    }

    // set ProjectImplementation address
    function setProjectImplementation(address _projectImplementation) external onlyOwner {
        require(_projectImplementation != address(0), "Invalid ProjectImplementation address");
        projectImplementation = IProjectImplementation(_projectImplementation);
    }

    // check and repay the due transaction manually
    function triggerRepayments() external {
        // call the function in ProjectImplementation
        (bool upkeepNeeded, uint256[] memory loanIdsToRepay) = projectImplementation.checkUpkeep();
        
        if (upkeepNeeded && loanIdsToRepay.length > 0) {
            projectImplementation.performUpkeep(loanIdsToRepay);
            emit UpkeepPerformed(loanIdsToRepay);
        }
    }
}
