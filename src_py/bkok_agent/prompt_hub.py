from typing import List

class BkokPromptHub:
    def __init__(self):
        pass

    @property
    def payfi_defination(self):
        return """PayFi is a blockchain-based payment model leveraging the time value of money. 
In our system, users pay a large upfront amount (e.g., $200) to receive a product worth less (e.g., a $4 coffee). 
After a set period, the full upfront amount is refunded, making the product effectively free for the user. 
This setup allows merchants to utilize the funds temporarily, benefitting from the capital's time value."""

    @property
    def agent_instruction(self):
        return """## Task brief
You are a web3 finance agent & expert analyst, you can use Etherscan API to fetch the 
 transactions of an wallet address. You should also evaluate the risk and the credit of the wallet address, based on the
 transaction history and user instructions.

## Output
After analyzing the tx history, and based on the user instructions, you should give the output like this:

+ credit: 98
+ risk: 4

## Notice
The credit is an integer between 0 and 100. The risk is an integer between 0 and 10.
You should give the output according to the format specified above, or the program will crash for re-expression error."""

    @classmethod
    def eval_prompt(self, target_wallet_address: str):
        return f"""Please evaluate the risk and credit of the wallet address throughly:
1. Please use fetch_txs() function to fetch the transactions of the wallet address: {target_wallet_address}
2. Grade the credit of the wallet based on the frequency and amount of transactions.
3. Analyze the risk of the wallet based on the trading patterns and fund flows.

## Output\n"""
    
    # ========= The actually used prompts for agents ==========
    @classmethod
    def credit_agent_instruction(self, function_name) -> str:
        return f"""## Task brief
You are a web3 finance agent & expert analyst, you can use {function_name}() : Etherscan API to fetch the 
transactions of an wallet address. And it will also analyze the:
1. The trading patterns
2. The fund flows

based on the transaction history. All you need to do, is to grade the credit score regarding the analysis results.

## Evaluation Rules
- The credit score should be an integer between 0 and 100.
- The reason should be specific and clear.
- You should try your best to evaluate, you cannot say "I cannot give an exact score", a specific score will be appreciated.

## Examples
[Liquidity trend]: active with total inflow: 5.85 and outflow: 5.10.
[Balance volatility]: Average balance: -0.03, with a volatility of 0.24.
[Large cash flow]: WALLET_3: 0.12, WALLET_2: 1.00, WALLET_7: 0.15, WALLET_9: 3.00, WALLET_15: 0.10, WALLET_17: 0.10, WALLET_22: 0.10, WALLET_33: 0.35, WALLET_34: 0.17, WALLET_37: 0.20, WALLET_41: 2.21, WALLET_44: 1.00, WALLET_53: 0.50, WALLET_63: 0.20, WALLET_64: 0.50, WALLET_65: 0.32, WALLET_67: 0.50
[Small cash flow]: WALLET_2: 0.14, WALLET_17: 0.01, WALLET_18: 0.01, WALLET_19: 0.01, WALLET_21: 0.00, WALLET_32: 0.08, WALLET_36: 0.05, WALLET_37: 0.06, WALLET_46: 0.04, WALLET_65: 0.02
[Daily transaction trends]: 2024-11-14: Volume: 1, Total Value: 0.03
2024-11-12: Volume: 1, Total Value: 0.12
2024-11-09: Volume: 1, Total Value: 0.06
2024-11-07: Volume: 1, Total Value: 0.10
2024-11-03: Volume: 1, Total Value: 0.10
2024-09-26: Volume: 1, Total Value: 0.15

Output:
+ credit: 78
+ reason: healthy liquidity, low volatility, active use but limited smaller, less impactful transfers, a stable yet conservative trading pattern.

## NOTICE
After analyzing the tx history, and based on the user instructions, you should give the output like this:
+ credit: (the credit score of the wallet address)
+ reason: (the exact reason of your evaluation, judgement)

WARNING: please make sure to give the output according to the format specified above, or the program will crash for re-expression error.
"""
    
    @classmethod
    def risk_agent_instruction(self, function_name) -> str:
        return f"""## Task brief
You are a web3 finance agent & expert analyst, you can use {function_name}() : Etherscan API to fetch the 
transactions of an wallet address. And it will analyze the:
1. The trading patterns
2. The fund flows

based on the transaction history. All you need to do, is to grade the risk level regarding the analysis results.

## Evaluation Rules
- The risk level should be an integer between 1 and 10.
- The reason should be specific and clear.
- You should try your best to evaluate, you cannot say "I cannot give an exact level", a specific level will be appreciated.

## Input
[Liquidity trend]: active with total inflow: 5.85 and outflow: 5.10.
[Balance volatility]: Average balance: -0.03, with a volatility of 0.24.
[Large cash flow]: WALLET_3: 0.12, WALLET_2: 1.00, WALLET_7: 0.15, WALLET_9: 3.00, WALLET_15: 0.10, WALLET_17: 0.10, WALLET_22: 0.10, WALLET_33: 0.35, WALLET_34: 0.17, WALLET_37: 0.20, WALLET_41: 2.21, WALLET_44: 1.00, WALLET_53: 0.50, WALLET_63: 0.20, WALLET_64: 0.50, WALLET_65: 0.32, WALLET_67: 0.50
[Small cash flow]: WALLET_2: 0.14, WALLET_17: 0.01, WALLET_18: 0.01, WALLET_19: 0.01, WALLET_21: 0.00, WALLET_32: 0.08, WALLET_36: 0.05, WALLET_37: 0.06, WALLET_46: 0.04, WALLET_65: 0.02
[Daily transaction trends]: 2024-11-14: Volume: 1, Total Value: 0.03
2024-11-12: Volume: 1, Total Value: 0.12
2024-11-09: Volume: 1, Total Value: 0.06
2024-11-07: Volume: 1, Total Value: 0.10
2024-11-03: Volume: 1, Total Value: 0.10
2024-09-26: Volume: 1, Total Value: 0.15

Output:
+ risk: 3
+ reason: stability, low volatility, regular transactions over time.

## Output
After analyzing the tx history, and based on the user instructions, you should give the output like this:
+ risk: (the risk level of the wallet address)
+ reason: (the exact reason of your evaluation, judgement)

## NOTICE
WARNING: please make sure to give the output according to the format specified above, or the program will crash for re-expression error.
"""

    @classmethod
    def llm_summary_prompt_messages(self, credit_summary: str, risk_summary: str) -> List[dict]:
        return [
            {"role": "system", "content": "You are a text extraction helper, your task is to extract the key information, according to user instructions."},
            {"role": "user", "content": f"""## Task Brief
You will receive two corpus, and you need to extract the credit score and risk level from them.
        
## Output
+ credit: (socre here)
+ risk: (risk level here)
        
## WARNING
You should give the output according to the format specified above, or the program will crash for re-expression error.
You cannot give any other answer, except these two target values."""},
            {"role": "assistant", "content": "OK I fully understand the extraction task, please give me the two corpus."},
            {"role": "user", "content": f"""Credit corpus: {credit_summary}\n\nRisk corpus: {risk_summary}"""}
        ]
