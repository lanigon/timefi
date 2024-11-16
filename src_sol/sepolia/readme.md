## ReadMe

This is the source code of our contract deploying on Sepolia TestNet. 



#### What is PayFi (or TimeFi).

User can buy a product with the revenue of lending a certain amount of money to a merchant for a certain amount of time. You can consider it as user can get their loan interest immediately when they lend money to the merchant, and spend this interest on buying a product from the merchant.

Like user want to buy a cup of coffee, it costs 4u. He can choose to pay it in normal way ---- transfer 4u to the merchant, or he can choose to pay it in PayFi(or TimeFi). In this way, user need lend 400u to the merchant for 7 days, and get the coffee for free.



#### The source code of the contract.

There are 2 contracts: `ProjectImplementation.sol` and `RepaymentManager.sol`. 

Sorry for the name, I wanted to add a proxy at the beginning, so I create another file called TimeFi. However in the end I found it's not necessary so I deleted it.

**The main functions of the contract:**

- Allow users to buy products from merchant by paying the bill in PayFi way (or TimeFi way).
- Allow merchant to proactively repay loans.
- Allow contract to repay the loans automatically if the merchant doesn't repay on time.



**Follow the instruction to deploy the contracts:**

I implemented and deployed it in Remix. So no extra needs for deploying this contract.

1. Copy the code in remix.

2. Press Ctrl + s to compile it. The remix will automatically install the reliance. Make sure you choose the correct compiler.

3. Deploying the `ProjectImplementation.sol`  first. 

   Choose the sepolia testnet. (Or the local net of remix and hardhat)
   Input the arguments with a Tokenname and Tokensymbol. Keep the contract address for the following steps.

4. Then deploying `RepaymentManager.sol` . Notice that the input argument is the address you copy from step3.

Then you have successfully deployed the contract.



**Then you can follow the following steps to initialize the contract and merchant account.**

1. Use the owner account call the function `setRepaymentManager` in `ProjectImplementation.sol`. The argument is the address of `RepaymentManager.sol` you just deployed.
2. Use the owner account call the function `setMerchantMaxLoanLimit `  in  `ProjectImplementation.sol`. The argument is the merchant account address and a number (like 1000). It will set the maximum limitation of this merchant can lend in PayFi way.
3. Use the merchant account call the function `initializeMerchantApproval` in `ProjectImplementation.sol`. The argument is a number (like 10000). It will approve a certain amount of money to the contract so the contract can repay the loan automatically when necessary. ---- In our dapp, this can be done by merchant themselves with our front client.



Then you have finished the initialization. Everyone can pay the bill by the minted token in the way of PayFi to this merchant account.