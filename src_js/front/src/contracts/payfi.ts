export const payfiaddress = "0xAF7785F8dDFC9629949eDdb07Ba14d53Fc853C14";
export const abi = [
  {
  "inputs": [
  {
  "internalType": "string",
  "name": "name_",
  "type": "string"
  },
  {
  "internalType": "string",
  "name": "symbol_",
  "type": "string"
  }
  ],
  "stateMutability": "nonpayable",
  "type": "constructor"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "spender",
  "type": "address"
  },
  {
  "internalType": "uint256",
  "name": "allowance",
  "type": "uint256"
  },
  {
  "internalType": "uint256",
  "name": "needed",
  "type": "uint256"
  }
  ],
  "name": "ERC20InsufficientAllowance",
  "type": "error"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "sender",
  "type": "address"
  },
  {
  "internalType": "uint256",
  "name": "balance",
  "type": "uint256"
  },
  {
  "internalType": "uint256",
  "name": "needed",
  "type": "uint256"
  }
  ],
  "name": "ERC20InsufficientBalance",
  "type": "error"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "approver",
  "type": "address"
  }
  ],
  "name": "ERC20InvalidApprover",
  "type": "error"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "receiver",
  "type": "address"
  }
  ],
  "name": "ERC20InvalidReceiver",
  "type": "error"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "sender",
  "type": "address"
  }
  ],
  "name": "ERC20InvalidSender",
  "type": "error"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "spender",
  "type": "address"
  }
  ],
  "name": "ERC20InvalidSpender",
  "type": "error"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "owner",
  "type": "address"
  }
  ],
  "name": "OwnableInvalidOwner",
  "type": "error"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "account",
  "type": "address"
  }
  ],
  "name": "OwnableUnauthorizedAccount",
  "type": "error"
  },
  {
  "anonymous": false,
  "inputs": [
  {
  "indexed": true,
  "internalType": "address",
  "name": "owner",
  "type": "address"
  },
  {
  "indexed": true,
  "internalType": "address",
  "name": "spender",
  "type": "address"
  },
  {
  "indexed": false,
  "internalType": "uint256",
  "name": "value",
  "type": "uint256"
  }
  ],
  "name": "Approval",
  "type": "event"
  },
  {
  "anonymous": false,
  "inputs": [
  {
  "indexed": true,
  "internalType": "address",
  "name": "user",
  "type": "address"
  },
  {
  "indexed": true,
  "internalType": "address",
  "name": "merchant",
  "type": "address"
  },
  {
  "indexed": false,
  "internalType": "uint256",
  "name": "amount",
  "type": "uint256"
  },
  {
  "indexed": false,
  "internalType": "uint256",
  "name": "dueDate",
  "type": "uint256"
  },
  {
  "indexed": false,
  "internalType": "uint256",
  "name": "loanId",
  "type": "uint256"
  }
  ],
  "name": "LoanGiven",
  "type": "event"
  },
  {
  "anonymous": false,
  "inputs": [
  {
  "indexed": true,
  "internalType": "address",
  "name": "merchant",
  "type": "address"
  },
  {
  "indexed": true,
  "internalType": "address",
  "name": "user",
  "type": "address"
  },
  {
  "indexed": false,
  "internalType": "uint256",
  "name": "amount",
  "type": "uint256"
  },
  {
  "indexed": false,
  "internalType": "uint256",
  "name": "loanId",
  "type": "uint256"
  }
  ],
  "name": "LoanRepaid",
  "type": "event"
  },
  {
  "anonymous": false,
  "inputs": [
  {
  "indexed": true,
  "internalType": "address",
  "name": "merchant",
  "type": "address"
  },
  {
  "indexed": false,
  "internalType": "address",
  "name": "spender",
  "type": "address"
  },
  {
  "indexed": false,
  "internalType": "uint256",
  "name": "amountApproved",
  "type": "uint256"
  }
  ],
  "name": "MerchantInitialized",
  "type": "event"
  },
  {
  "anonymous": false,
  "inputs": [
  {
  "indexed": true,
  "internalType": "address",
  "name": "previousOwner",
  "type": "address"
  },
  {
  "indexed": true,
  "internalType": "address",
  "name": "newOwner",
  "type": "address"
  }
  ],
  "name": "OwnershipTransferred",
  "type": "event"
  },
  {
  "anonymous": false,
  "inputs": [
  {
  "indexed": true,
  "internalType": "address",
  "name": "newRepaymentManager",
  "type": "address"
  }
  ],
  "name": "RepaymentManagerSet",
  "type": "event"
  },
  {
  "anonymous": false,
  "inputs": [
  {
  "indexed": true,
  "internalType": "address",
  "name": "from",
  "type": "address"
  },
  {
  "indexed": true,
  "internalType": "address",
  "name": "to",
  "type": "address"
  },
  {
  "indexed": false,
  "internalType": "uint256",
  "name": "value",
  "type": "uint256"
  }
  ],
  "name": "Transfer",
  "type": "event"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "owner",
  "type": "address"
  },
  {
  "internalType": "address",
  "name": "spender",
  "type": "address"
  }
  ],
  "name": "allowance",
  "outputs": [
  {
  "internalType": "uint256",
  "name": "",
  "type": "uint256"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "spender",
  "type": "address"
  },
  {
  "internalType": "uint256",
  "name": "value",
  "type": "uint256"
  }
  ],
  "name": "approve",
  "outputs": [
  {
  "internalType": "bool",
  "name": "",
  "type": "bool"
  }
  ],
  "stateMutability": "nonpayable",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "account",
  "type": "address"
  }
  ],
  "name": "balanceOf",
  "outputs": [
  {
  "internalType": "uint256",
  "name": "",
  "type": "uint256"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [],
  "name": "checkUpkeep",
  "outputs": [
  {
  "internalType": "bool",
  "name": "upkeepNeeded",
  "type": "bool"
  },
  {
  "internalType": "uint256[]",
  "name": "loanIdsToRepay",
  "type": "uint256[]"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [],
  "name": "decimals",
  "outputs": [
  {
  "internalType": "uint8",
  "name": "",
  "type": "uint8"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "user",
  "type": "address"
  },
  {
  "internalType": "address",
  "name": "merchant",
  "type": "address"
  }
  ],
  "name": "getLoansBetween",
  "outputs": [
  {
  "internalType": "string",
  "name": "",
  "type": "string"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "merchant",
  "type": "address"
  }
  ],
  "name": "getTransactions",
  "outputs": [
  {
  "internalType": "string",
  "name": "",
  "type": "string"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "uint256",
  "name": "amount",
  "type": "uint256"
  }
  ],
  "name": "initializeMerchantApproval",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "merchant",
  "type": "address"
  },
  {
  "internalType": "uint256",
  "name": "amount",
  "type": "uint256"
  },
  {
  "internalType": "uint256",
  "name": "daysUntilDue",
  "type": "uint256"
  }
  ],
  "name": "lendToMerchant",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "",
  "type": "address"
  },
  {
  "internalType": "address",
  "name": "",
  "type": "address"
  }
  ],
  "name": "loanCount",
  "outputs": [
  {
  "internalType": "uint256",
  "name": "",
  "type": "uint256"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "",
  "type": "address"
  },
  {
  "internalType": "address",
  "name": "",
  "type": "address"
  },
  {
  "internalType": "uint256",
  "name": "",
  "type": "uint256"
  }
  ],
  "name": "loanIds",
  "outputs": [
  {
  "internalType": "uint256",
  "name": "",
  "type": "uint256"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "uint256",
  "name": "",
  "type": "uint256"
  }
  ],
  "name": "loans",
  "outputs": [
  {
  "internalType": "uint256",
  "name": "loanId",
  "type": "uint256"
  },
  {
  "internalType": "address",
  "name": "buyer",
  "type": "address"
  },
  {
  "internalType": "address",
  "name": "merchant",
  "type": "address"
  },
  {
  "internalType": "uint256",
  "name": "amount",
  "type": "uint256"
  },
  {
  "internalType": "uint256",
  "name": "dueDate",
  "type": "uint256"
  },
  {
  "internalType": "uint256",
  "name": "repaidAmount",
  "type": "uint256"
  },
  {
  "internalType": "bool",
  "name": "isRepaid",
  "type": "bool"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "",
  "type": "address"
  }
  ],
  "name": "merchantCurrentLoans",
  "outputs": [
  {
  "internalType": "uint256",
  "name": "",
  "type": "uint256"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "",
  "type": "address"
  }
  ],
  "name": "merchantMaxLoanLimits",
  "outputs": [
  {
  "internalType": "uint256",
  "name": "",
  "type": "uint256"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [],
  "name": "name",
  "outputs": [
  {
  "internalType": "string",
  "name": "",
  "type": "string"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [],
  "name": "nextLoanId",
  "outputs": [
  {
  "internalType": "uint256",
  "name": "",
  "type": "uint256"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [],
  "name": "owner",
  "outputs": [
  {
  "internalType": "address",
  "name": "",
  "type": "address"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "uint256[]",
  "name": "loanIdsToRepay",
  "type": "uint256[]"
  }
  ],
  "name": "performUpkeep",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
  },
  {
  "inputs": [],
  "name": "renounceOwnership",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "user",
  "type": "address"
  },
  {
  "internalType": "uint256",
  "name": "loanId",
  "type": "uint256"
  },
  {
  "internalType": "uint256",
  "name": "amount",
  "type": "uint256"
  }
  ],
  "name": "repayLoan",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
  },
  {
  "inputs": [],
  "name": "repaymentManager",
  "outputs": [
  {
  "internalType": "address",
  "name": "",
  "type": "address"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "merchant",
  "type": "address"
  },
  {
  "internalType": "uint256",
  "name": "maxLimit",
  "type": "uint256"
  }
  ],
  "name": "setMerchantMaxLoanLimit",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "_repaymentManager",
  "type": "address"
  }
  ],
  "name": "setRepaymentManager",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
  },
  {
  "inputs": [],
  "name": "symbol",
  "outputs": [
  {
  "internalType": "string",
  "name": "",
  "type": "string"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [],
  "name": "totalSupply",
  "outputs": [
  {
  "internalType": "uint256",
  "name": "",
  "type": "uint256"
  }
  ],
  "stateMutability": "view",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "to",
  "type": "address"
  },
  {
  "internalType": "uint256",
  "name": "value",
  "type": "uint256"
  }
  ],
  "name": "transfer",
  "outputs": [
  {
  "internalType": "bool",
  "name": "",
  "type": "bool"
  }
  ],
  "stateMutability": "nonpayable",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "from",
  "type": "address"
  },
  {
  "internalType": "address",
  "name": "to",
  "type": "address"
  },
  {
  "internalType": "uint256",
  "name": "value",
  "type": "uint256"
  }
  ],
  "name": "transferFrom",
  "outputs": [
  {
  "internalType": "bool",
  "name": "",
  "type": "bool"
  }
  ],
  "stateMutability": "nonpayable",
  "type": "function"
  },
  {
  "inputs": [
  {
  "internalType": "address",
  "name": "newOwner",
  "type": "address"
  }
  ],
  "name": "transferOwnership",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
  }
  ]

export const merchant = "0x2425A2d476840501f1863840fAAC5778E6Cb1e17";