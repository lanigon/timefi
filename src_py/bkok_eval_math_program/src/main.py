from nada_dsl import *

def nada_main():
    """You can define this computing module on your own, here we just make this initial setting.
        This setting works well to credit-evaluation program in actual use.

        If you are an expert in math, feel free to change this computing strategy."""
    
    # here we can only use integer, so just times 100, we will process it later
    party1 = Party(name="Party1")

    # the old credit, and old base number will be stored in nillion
    old_credit = SecretInteger(Input(name="old_credit", party=party1))              # int, 10 < credit <100, but consider as float, credit / 10
    old_base_number = SecretInteger(Input(name="old_base_number", party=party1))    # int, > 1000 usd

    credit_score = SecretInteger(Input(name="credit_score", party=party1))          # int, given by llm output, original x 100
    risk_level = SecretInteger(Input(name="risk_level", party=party1))              # int, given by llm output, original x 100

    new_credit_cause = (credit_score - Integer(6000)) / Integer(500)    # 70 -> 10 / 100 * 0.2 = 2%
    # the reason why `0.2` exists, is to try to make the changing more smooth, and not too sudden
    new_credit = old_credit * (Integer(100) + new_credit_cause) / Integer(100)    # this can be negative, but it's fine

    new_credit_bool: SecretBoolean = new_credit < Integer(1000) 
    new_credit = new_credit_bool.if_else(new_credit, Integer(1000))  # directly set the limit to 100, if it's greater than 100

    new_base_number_cause = (Integer(700) - risk_level) / Integer(25)   # 4 -> 0.6*0.2 = 0.12, 9 -> -0.4 * 0.2 = -0.08
    # the reason why `0.2` exists, is to try to make the changing more smooth, and not too sudden
    new_base_number = old_base_number * (Integer(100) + new_base_number_cause) / Integer(100) # this can be negative, but it's fine

    limit = (new_credit) * new_base_number / Integer(100)

    return [Output(limit, "new_limit", party1), Output(new_credit, "new_credit", party1), Output(new_base_number, "new_base_number", party1)]