## ReadMe

This is the source code of our contract deploying on Flow Testnet. 



#### What is TimeFi.

TimeFi is **a trust-driven transaction platform that enables free products for buyers and time-value earnings for merchants**.

The core idea behind **TimeFi** is that users lend a certain amount of coins to merchants for a period of time to purchase their goods. Once the lending period expires, the merchants return the borrowed coins to the users. Essentially, users receive the interest from the loan in advance and use it to buy goods, while merchants exchange their goods for temporary ownership of the coins.

This concept is both innovative and versatile, with significant potential in various scenarios.

On the one hand, **TimeFi is particularly well-suited for small and medium-sized businesses or startups seeking funding**. For example, imagine Alice runs a small flower shop and wants to expand her business. However, bank loans often require complex credit evaluations, lengthy procedures, and come with high interest rates. In such cases, TimeFi would be a more suitable alternative. Alice’s customers can choose to pay via TimeFi, effectively helping her raise funds, and in return, Alice can offer them mutually agreed-upon products, like a bouquet of flowers. Through TimeFi, Alice can secure substantial, negotiable-interest loans over a short period, with the flexibility of repaying the interest in the form of goods. Isn’t that amazing? If I were Alice, I’d be thrilled to use such a model to gradually scale up my shop without the burden of high bank interest rates and tedious processes.

On the other hand, **TimeFi is inherently a trust-based payment method that transforms borrowing into a form of transaction**, placing a strong emphasis on mutual trust among users. This trust motivates users to adopt TimeFi for payments, and in turn, using TimeFi strengthens their trust in each other. This virtuous cycle not only encourages more users to join the TimeFi community but also fosters a more harmonious and friendly ecosystem.



#### The source code of the contract.

There are 2 contracts: `ProjectImplementation.sol` and `RepaymentManager.sol`. 

Their addresses are:
`ProjectImplementation.sol`：0xB626C2801Dc36801eCC7D0E876451943FF0D36de
`RepaymentManager.sol`：0xbE41F7EC499Be94D484686AbF3c6b844E2003A73

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

   Choose the Flow Testnet. (Or the local net of remix and hardhat)
   Input the arguments with a Tokenname and Tokensymbol. Keep the contract address for the following steps.

4. Then deploying `RepaymentManager.sol` . Notice that the input argument is the address you copy from step3.

Then you have successfully deployed the contract.



**Then you can follow the following steps to initialize the contract and merchant account.**

1. Use the owner account call the function `setRepaymentManager` in `ProjectImplementation.sol`. The argument is the address of `RepaymentManager.sol` you just deployed.
2. Use the owner account call the function `setMerchantMaxLoanLimit `  in  `ProjectImplementation.sol`. The argument is the merchant account address and a number (like 1000). It will set the maximum limitation of this merchant can lend in PayFi way.
3. Use the merchant account call the function `initializeMerchantApproval` in `ProjectImplementation.sol`. The argument is a number (like 10000). It will approve a certain amount of money to the contract so the contract can repay the loan automatically when necessary. ---- In our dapp, this can be done by merchant themselves with our front client.



Then you have finished the initialization. Everyone can pay the bill by the minted token in the way of PayFi to this merchant account.