// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProjectImplementation is ERC20, Ownable {
    mapping(address => uint256) public merchantMaxLoanLimits; // merchant -> MaxLoanLimit
    mapping(address => uint256) public merchantCurrentLoans; // merchant -> CurrentLoans
    address public repaymentManager; // address of RepaymentManager (for auto-repayment)

    // information of transaction
    struct Loan {
        uint256 loanId;
        address buyer;
        address merchant; 
        uint256 amount; 
        uint256 dueDate; 
        uint256 repaidAmount; // the repaid amount
        bool isRepaid;
    }
    // loanId -> Loan struct
    mapping(uint256 => Loan) public loans;

    // mapping(address => mapping(address => uint256[])) public loanIds;
    // user -> merchant -> count
    mapping(address => mapping(address => uint256)) public loanCount; 
    // user -> merchant -> loanIndex -> loanId
    mapping(address => mapping(address => mapping(uint256 => uint256))) public loanIds; 

    uint256 public nextLoanId = 1; // payFi LoanID generator

    event LoanGiven(address indexed user, address indexed merchant, uint256 amount, uint256 dueDate, uint256 loanId);
    event LoanRepaid(address indexed merchant, address indexed user, uint256 amount, uint256 loanId);
    event MerchantInitialized(address indexed merchant, address spender, uint256 amountApproved);
    event RepaymentManagerSet(address indexed newRepaymentManager);

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**decimals()); 
    }

    // set the MaxLoanLimit of merchant(only owner)
    function setMerchantMaxLoanLimit(address merchant, uint256 maxLimit) external onlyOwner {
        require(merchant != address(0), "Invalid merchant address");
        merchantMaxLoanLimits[merchant] = maxLimit;
    }

    // set RepaymentManager address(only owner)
    function setRepaymentManager(address _repaymentManager) external onlyOwner {
        require(_repaymentManager != address(0), "Invalid RepaymentManager address");
        repaymentManager = _repaymentManager;
        emit RepaymentManagerSet(_repaymentManager);
    }

    // initialize the merchant account, to allow it can repay automatically
    function initializeMerchantApproval(uint256 amount) external {
        require(repaymentManager != address(0), "RepaymentManager not set");
        approve(repaymentManager, amount); // 将 RepaymentManager 设为 spender
        emit MerchantInitialized(msg.sender, repaymentManager, amount);
    }

    // user pay the merchant in PayFi, and set the dueDate(now it is in second, so it's convinent to show the funtion)
    function lendToMerchant(address merchant, uint256 amount, uint256 daysUntilDue) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance to lend");
        require(merchant != address(0), "Invalid merchant address");
        require(merchant != msg.sender, "Can not PayFi to yourself");
        require(daysUntilDue > 0, "Due date must be greater than zero");
        require(merchantMaxLoanLimits[merchant] > 0, "Merchant has no loan limit set");
        require(
            merchantMaxLoanLimits[merchant] >= merchantCurrentLoans[merchant] + amount,
            "Loan amount exceeds merchant's available limit"
        );

        _transfer(msg.sender, merchant, amount);

        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            loanId: loanId,
            buyer: msg.sender,
            merchant: merchant,
            amount: amount,
            dueDate: block.timestamp + (daysUntilDue * 1 seconds),
            repaidAmount: 0,
            isRepaid: false
        });

        uint256 loanIndex = loanCount[msg.sender][merchant];
        loanIds[msg.sender][merchant][loanIndex] = loanId;
        loanCount[msg.sender][merchant] += 1;

        // loanIds[msg.sender][merchant].push(loanId);

        merchantCurrentLoans[merchant] += amount;

        emit LoanGiven(msg.sender, merchant, amount, block.timestamp + (daysUntilDue * 1 days), loanId);
    }

    // merchant repay it manually
    function repayLoan(address user, uint256 loanId, uint256 amount) external {
        Loan storage loan = loans[loanId];
        require(loan.amount > 0, "Loan not found");
        require(!loan.isRepaid, "Loan has already been repaid");
        require(loan.amount - loan.repaidAmount >= amount, "Repayment amount exceeds loan balance");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance to repay");
        
        _transfer(msg.sender, user, amount);

        loan.repaidAmount += amount;
        if (loan.repaidAmount >= loan.amount) {
            loan.isRepaid = true;
        }

        merchantCurrentLoans[msg.sender] -= amount;

        emit LoanRepaid(msg.sender, user, amount, loanId);
    }

    // get the transaction between user and merchant
    function getLoansBetween(address user, address merchant) external view returns (string memory) {
        // uint256[] memory loanIdArray = loanIds[user][merchant];
        uint256 count = loanCount[user][merchant];
        Loan[] memory loanHistory = new Loan[](count);
        for (uint i = 0; i < count; i++) {
            uint256 loanId = loanIds[user][merchant][i];
            loanHistory[i] = loans[loanId];
        }
        bytes memory result = "[";
        for (uint256 i = 0; i < count; i++) {
            Loan memory loan = loanHistory[i];
            result = abi.encodePacked(
                result,
                "{\"loanId\":", uint2str(loan.loanId),
                ",\"buyer\":\"", addressToString(loan.buyer),
                "\",\"merchant\":\"", addressToString(loan.merchant),
                "\",\"amount\":", uint2str(loan.amount),
                ",\"dueDate\":", uint2str(loan.dueDate),
                ",\"repaidAmount\":", uint2str(loan.repaidAmount),
                ",\"isRepaid\":", loan.isRepaid ? "true" : "false",
                "}"
            );
            if (i < count - 1) {
                result = abi.encodePacked(result, ",");
            }
        }
        result = abi.encodePacked(result, "]");
        return string(result);
    }

    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bstr[k] = bytes1(temp);
            _i /= 10;
        }
        return string(bstr);
    }

    function addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    // check whether there are due transactions
    function checkUpkeep() external view returns (bool upkeepNeeded, uint256[] memory loanIdsToRepay) {
        uint256 count = 0;
        uint256[] memory tempLoanIds = new uint256[](nextLoanId - 1);
        for (uint256 i = 1; i < nextLoanId; i++) {
            Loan storage loan = loans[i];
            if (block.timestamp >= loan.dueDate && !loan.isRepaid) {
                tempLoanIds[count] = loan.loanId;
                count++;
            }
        }

        if (count > 0) {
            upkeepNeeded = true;
            loanIdsToRepay = new uint256[](count);
            for (uint256 i = 0; i < count; i++) {
                loanIdsToRepay[i] = tempLoanIds[i];
            }
        } else {
            upkeepNeeded = false;
        }
    }

    // repay automatically
    function performUpkeep(uint256[] memory loanIdsToRepay) external {
        for (uint256 i = 0; i < loanIdsToRepay.length; i++) {
            uint256 loanId = loanIdsToRepay[i];
            Loan storage loan = loans[loanId];
            require(loan.amount > 0, "Loan not found");
            require(block.timestamp >= loan.dueDate, "Loan is not yet due");
            require(!loan.isRepaid, "Loan has already been repaid");
            uint256 amount = loan.amount - loan.repaidAmount;
            require(balanceOf(loan.merchant) >= (amount), "Insufficient balance for repayment");


            // 从商家账户转移未偿还的金额到买家
            transferFrom(loan.merchant, loan.buyer, amount);

            // 更新借款记录
            loan.repaidAmount = loan.amount;
            loan.isRepaid = true;
            merchantCurrentLoans[loan.merchant] -= amount;

            emit LoanRepaid(loan.merchant, loan.buyer, amount, loanId);
        }
    }
    function getLoanIds(address user, address merchant) public view returns (uint256) {
    return loanCount[user][merchant];
    }
}