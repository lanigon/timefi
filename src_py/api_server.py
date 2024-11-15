from fastapi import FastAPI
from contextlib import asynccontextmanager
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os
import asyncio
import httpx
from web3 import Web3
from typing import List
from loguru import logger
import re
from datetime import datetime


# ======= Custom modules =======
from bkok_agent import (
    BkokAgent, 
    BkokPromptHub,
    AgentResponse,
    step_agent_async
)
from bkok_utils import (
    BalanceRequest,
    CreditRequest,
    TXSRequest,
    warp_etherscan_url,
    get_tx_brief
)

openai_api_key = None
openai_model_name = None
openai_base_url = None

etherscan_api_key = None

aclient: AsyncOpenAI = None
bkok_prompt_hub: BkokPromptHub = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_dotenv()
    global openai_api_key, openai_model_name, openai_base_url, aclient, etherscan_api_key, bkok_prompt_hub
    openai_api_key = os.getenv("OPENAI_API_KEY", "5a85844c9763640eddc40419e1ffef29.NMNgVsNfgIf3RT3Z")
    openai_model_name = os.getenv("OPENAI_MODEL_NAME", "glm-4-flash")
    openai_base_url = os.getenv("OPENAI_BASE_URL", "https://open.bigmodel.cn/api/paas/v4/")

    etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")

    bkok_prompt_hub = BkokPromptHub()

    aclient = AsyncOpenAI(api_key=openai_api_key, base_url=openai_base_url)
    try:
        yield
    finally:
        pass
    # do something here

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def root():
    return {"status": "OK", 
            "message": """This server is for Bankok 2024 ETH hackathon, and do not have a front end.
You may refer to `/docs` to see the detail."""}

@app.post("/api/txs")
async def get_txs(request: TXSRequest):
    global etherscan_api_key
    wallet_address = request.wallet_address
    wallet_address = wallet_address.lower()
    chain_id = request.chain_id
    use_sepolia = request.use_sepolia

    if use_sepolia:
        etherscan_bls_url = warp_etherscan_url(wallet_address, etherscan_api_key=etherscan_api_key, use_sepolia=True,
                                           action="balance")
        etherscan_txs_url = warp_etherscan_url(wallet_address, etherscan_api_key=etherscan_api_key, use_sepolia=True,
                                           action="txlist")
    else:
        etherscan_bls_url = warp_etherscan_url(wallet_address, etherscan_api_key=etherscan_api_key, chain_id=chain_id, 
                                           use_sepolia=False, action="balance")
        etherscan_txs_url = warp_etherscan_url(wallet_address, etherscan_api_key=etherscan_api_key, chain_id=chain_id, 
                                           use_sepolia=False, action="txlist")
        
    async with httpx.AsyncClient() as client:
        response = await client.get(etherscan_bls_url)
        response.raise_for_status()
        data = response.json()
        balance = data.get("result")

    async with httpx.AsyncClient() as client:
        response = await client.get(etherscan_txs_url)
        response.raise_for_status()
        data = response.json()
        txs = data.get("result")

    rt_dict = {"wallet": wallet_address, "balance": balance, "txs": []}
    tx_addr_mapping = {}
    if isinstance(txs, str):
        print(txs)
        return f"Error: {txs}"
    for i, tx in enumerate(txs):
        tx_info = get_tx_brief(tx, wallet_address)
        from_addr = tx_info['from_wallet']
        to_addr = tx_info['to_wallet']

        tx_type = ""
        if i == 0:
            # print(f"from_addr: {from_addr}, wallet_address: {wallet_address}")
            if from_addr == wallet_address:
                tx_addr_mapping[from_addr] = f"WALLET_Self"     # record itself as the first address
                tx_addr_mapping[to_addr] = f"WALLET_{i+2}"     # record the other
                tx_type = "out"
            else:
                tx_addr_mapping[to_addr] = f"WALLET_Self"     # record the other
                tx_addr_mapping[from_addr] = f"WALLET_{i+2}" 
                tx_type = "in"
        else:
            tx_type = "out" if from_addr == wallet_address else "in"
            if tx_type == "out":
                if to_addr not in tx_addr_mapping:
                    tx_addr_mapping[to_addr] = f"WALLET_{i+2}"
            else:
                if from_addr not in tx_addr_mapping:
                    tx_addr_mapping[from_addr] = f"WALLET_{i+2}"

        tx_info['from_wallet'] = tx_addr_mapping.get(from_addr, from_addr)
        tx_info['to_wallet'] = tx_addr_mapping.get(to_addr, to_addr)
        tx_info['type'] = tx_type

        if tx_info['amount'] == "0 ETH" or tx_info['amount'] == "0.0000000 ETH":
            continue
        else:
            rt_dict["txs"].append(tx_info)

    return rt_dict



@app.post("/api/balance")
async def get_balance(request: BalanceRequest):
    global etherscan_api_key
    wallet_address = request.wallet_address
    chain_id = request.chain_id
    use_sepolia = request.use_sepolia

    if use_sepolia:
        etherscan_url = warp_etherscan_url(wallet_address, etherscan_api_key=etherscan_api_key, use_sepolia=True)
    else:
        etherscan_url = warp_etherscan_url(wallet_address, etherscan_api_key=etherscan_api_key, chain_id=chain_id, 
                                           use_sepolia=False)

    # print(f"Etherscan URL: {etherscan_url}")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(etherscan_url, timeout=10.0)
            response.raise_for_status()
            response_json: dict = response.json()
            balance = response_json.get("result")
            return {"status": "OK", "balance": Web3.from_wei(int(balance), "ether")}
        except httpx.HTTPStatusError as exc:
            return {"status": "Error", "message": f"Failed to fetch balance: {exc.response.status_code}"}
        except httpx.RequestError as exc:
            return {"status": "Error", "message": f"Request error: {str(exc)}"}

@app.post("/api/eval_wallet")
async def eval_wallet(request: CreditRequest):
    global bkok_prompt_hub
    wallet_address = request.wallet_address
    chain_id = request.chain_id
    use_sepolia = request.use_sepolia

    last_eval_time: str = request.last_eval_time
    last_eval_time_utc = datetime.fromtimestamp(int(last_eval_time))

    url_prefix = "https://api-sepolia.etherscan.io/api?"

    # ========= Launch Agent query & evaluate ==========
    res_dict = await step_agent_async(url_prefix=url_prefix, 
                                      wallet_address=wallet_address,
                                      last_eval_time_utc=last_eval_time_utc)
    summary: str = res_dict.get("final_summary")
    valid_ans: bool = True
    try:
        matches = re.findall(r"\+ (\w+): (\d+)", summary)
        ai_eval_result = {key: int(value) for key, value in matches}
    except Exception as e:
        logger.error(f"Failed to parse AI evaluation result: {e}")
        valid_ans = False
    finally:
        if 'credit' not in ai_eval_result or 'risk' not in ai_eval_result or not isinstance(ai_eval_result['credit'], int) or not isinstance(ai_eval_result['risk'], int):
            valid_ans = False

    rt_dict = {"status": "OK"}

    # ========= Error handling, retry if necessary ======
    if not valid_ans:
        try:
            logger.warning(f"Invalid AI evaluation result, retrying...")
            res_dict = await step_agent_async(url_prefix=url_prefix, wallet_address=wallet_address,
                                              last_eval_time_utc=last_eval_time_utc) # retry
            summary: str = res_dict.get("final_summary")
            matches = re.findall(r"\+ (\w+): (\d+)", summary)
            ai_eval_result = {key: int(value) for key, value in matches}
        except Exception as e:
            logger.error(f"Failed to parse AI evaluation result: {e}")
            rt_dict.update(res_dict)
            rt_dict.update({"credit": -1, "risk": -1})
            return rt_dict
    
    # ========= END Agent module =========
    rt_dict.update(res_dict)
    rt_dict.update(ai_eval_result)

    # ========= Mathematical calculation ==========
    

    return rt_dict
