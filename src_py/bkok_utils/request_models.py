from pydantic import BaseModel

class BalanceRequest(BaseModel):
    wallet_address: str
    chain_id: int
    use_sepolia: bool

class CreditRequest(BaseModel):
    wallet_address: str
    use_sepolia: bool

class TXSRequest(BaseModel):
    wallet_address: str
    chain_id: int
    use_sepolia: bool

class NillionRequest(BaseModel):
    wallet_address: str
    credit_score: int
    risk_level: int

class RetrivalCreditRequest(BaseModel):
    wallet_address: str