from pydantic import BaseModel

class BalanceRequest(BaseModel):
    wallet_address: str
    chain_id: int
    use_sepolia: bool

class CreditRequest(BaseModel):
    wallet_address: str
    chain_id: int
    use_sepolia: bool
    last_base: int
    last_credit: float
    last_eval_time: str=None  # the Unix timestamp of the last evaluation time, we will convert later to datetime object

class TXSRequest(BaseModel):
    wallet_address: str
    chain_id: int
    use_sepolia: bool