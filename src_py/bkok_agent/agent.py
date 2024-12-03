from openai import OpenAI, AsyncOpenAI
import asyncio
import json
import os
from pydantic import BaseModel
from swarm import Swarm, Agent

from typing import List, Tuple, Callable, Union, Dict, Optional
from dotenv import load_dotenv
import requests
from web3 import Web3
from loguru import logger
from datetime import datetime
import threading
from queue import Queue

# ========= Custom =========
from bkok_agent.prompt_hub import BkokPromptHub
from bkok_utils import complete_etherscan_sepolia_url
from bkok_agent.math_stats import step_1_stat_txs, step_2_agent_pre_analysis
from bkok_agent.nillion_tools import NillionManager, create_nillion_manager

load_dotenv()

# ========= Helper Classes and functions =========
class AgentResponse(BaseModel):
    assistant_messages: List[str]
    tool_messages: List[str]


def post_process_response(messages: List[dict]) -> AgentResponse:
    assistant_messages = []
    tool_messages = []
    for message in messages:
        match message.get("role"):
            case "assistant":
                if message.get("content") is not None:
                    assistant_messages.append(message.get("content"))

            case "tool":
                if message.get("content") is not None:
                    tool_messages.append(message.get("content"))

    return AgentResponse(assistant_messages=assistant_messages, tool_messages=tool_messages)
# =================================================

# ========= Agent =========
AgentFunction = Callable[[], Union[str, "Agent", dict]]

class BkokAgent:
    def __init__(self, 
                 client: OpenAI, 
                 model_name: str,
                 agent_name: str,
                 debug: bool=False,
                 max_turns: int=10,
                 functions: List[AgentFunction]=None,
                 instructions: str="You are an helpful agent.",
                 ctx_vars: Dict[str, str]=None):
        """The standard, general template for an agent, built on top of the Swarm framework.
            Args:
                client (OpenAI): An instance of the OpenAI API client.
                model_name (str): The name of the model to use for completions.
                agent_name (str): The name of the agent.
                debug (bool, optional): Whether to run in debug mode. Defaults to False.
                max_turns (int, optional): The maximum number of turns to run. Defaults to 10.
                functions (List[AgentFunction], optional): A list of functions to run during the agent's turn. Defaults to None.
                instructions (str, optional): The instructions to show to the user. Defaults to "You are an helpful agent.".
                ctx_vars (Dict[str, str], optional): A dictionary of context_variables to pass to the agent. Defaults to None.
        """
        # currently, the swarm only support OpenAI API, not async
        self.openai_client = client
        self.model_name = model_name

        # create swarm client
        self.client = Swarm(client=self.openai_client)
        # create agent
        self.agent = Agent(name=agent_name, model=self.model_name,
                           functions=functions, instructions=instructions)

        self.debug = debug
        self.max_turns = max_turns
        self.ctx_vars = ctx_vars or {}

    async def create_completion_async(self, messages: List[dict], 
                                    max_tokens: int=512):
        """
            Create completion for a list of messages using the specified model.
            
            This function work as the only entry point for llm inferencing."""
        tmp_aclient = AsyncOpenAI(api_key=self.openai_client.api_key, base_url=self.openai_client.base_url)
        try:
            completions = await tmp_aclient.chat.completions.create(
                messages=messages, 
                model=self.model_name, 
                max_tokens=max_tokens,
                temperature=0.01)
            return completions.choices[0].message.content
        except Exception as e:
            return f"Error: {e}"
        
    def run(self, messages: List[dict]) -> AgentResponse:
        response_messages = self.client.run(
            agent=self.agent,
            context_variables=self.ctx_vars,
            messages=messages,
            debug=self.debug,
            max_turns=self.max_turns,
        )
        return post_process_response(response_messages.messages)
    

def create_bkok_agent(agent_name: str, instructions: str,
                      functions: List[AgentFunction], ctx_vars: Dict[str, str]=None,
                      debug: bool=False, max_turns: int=10,) -> BkokAgent:
    """The helper function to create a BkokAgent instance."""
    openai_api_key = os.getenv("OPENAI_API_KEY", None)
    if openai_api_key is None:
        raise ValueError("OPENAI_API_KEY environment variable is not set.")
    openai_base_url = os.getenv("OPENAI_BASE_URL")
    openai_client = OpenAI(api_key=openai_api_key, base_url=openai_base_url)

    openai_model_name = os.getenv("OPENAI_MODEL_NAME")

    return BkokAgent(
        client=openai_client,
        model_name=openai_model_name,
        agent_name=agent_name,
        debug=debug,
        max_turns=max_turns,
        functions=functions,
        instructions=instructions,
        ctx_vars=ctx_vars,
    )

# ========= exposed to outside packages =========
def create_bkok_agent_wrapper(etherscan_url_prefix: str, 
                               agent_name: str, 
                               agent_instruction: str,
                               last_eval_time_utc: Optional[datetime]=None,
                               debug: bool=False, ) -> BkokAgent:
    """The helper function to create a BkokAgent instance for wallet credit processing."""
    etherscan_api_key = os.getenv("ETHERSCAN_API_KEY", None)
    if etherscan_api_key is None:
        raise ValueError("ETHERSCAN_API_KEY environment variable is not set.")

    def fetch_tx_agent_func(context_variables: dict, wallet_address: str) -> str:
        """Use the custom API to get the balance or transaction list of a wallet address.
            Also analyze the transaction patterns and fund flows, and provide a summary."""
        if not isinstance(wallet_address, str) or wallet_address[1] != 'x':
            return "Invalid wallet address format. Please provide a valid wallet address."
        
        wallet_address = wallet_address.lower()

        rt_str = ""

        # then we get the transaction list
        etherscan_txlist_url = f"http://18.143.117.194:8080/transactions?target={wallet_address}"
        response = requests.get(etherscan_txlist_url)
        res2: dict = response.json()
        print(res2)
        txs: List[dict] = res2
        if len(txs) == 0:
            return "No transaction found for this wallet address."
        
        # here we will prepare a hashmap, to record the wallet address, to save tokens comsuming by llm.
        # we will cut the txs, only grep the ones after the last eval time.
        last_eval_time: datetime = context_variables.get("last_eval_time", None)
        stat_txs_dicts = step_1_stat_txs(txs, wallet_address, last_eval_time=last_eval_time)

        analysis_text = step_2_agent_pre_analysis(stat_txs_dicts)
        # logger.info(f"Analysis Text: {analysis_text}")
        rt_str += analysis_text
        return rt_str
    
    return create_bkok_agent(
        agent_name=agent_name,
        instructions=agent_instruction,
        functions=[fetch_tx_agent_func],
        ctx_vars={"last_eval_time": last_eval_time_utc},
        debug=debug,
        )

g_user_storage: Dict[str, int] = {}
g_nlm_storage: Dict[str, int] = {}

async def step_nillion_async(credit_score: int, risk_level: int, user_address: str,
                             old_credit: int=None, old_base_number: int=None, store_id=None) -> Tuple[int, int]:
    """Either old_credit and old_base_number can be null, or store_id can be null,
        previous means the first time,
        latter means after the first time."""
    global g_nlm_storage
    nlm: NillionManager = None
    if user_address not in g_nlm_storage:
        nlm = await create_nillion_manager(user_address)
    else:
        nlm = g_nlm_storage[user_address]
    if old_credit is not None:
        # this is the first time
        new_credit = old_credit
        new_base_number = old_base_number
        store_id = await nlm.store_secret_integer(secret_value_base_number=new_base_number, secret_value_credit=new_credit)
        logger.warning(f"This is the first time, our store_id is: {store_id}")
    result = await nlm.compute_result(credit_score=credit_score, risk_level=risk_level, store_id=store_id)
    logger.info(f"Result: {result}")
    new_credit = result['new_credit']
    new_base_number = result['new_base_number']

    # after executing, we need store again
    new_store_id = await nlm.store_secret_integer(secret_value_base_number=new_base_number, 
                                                  secret_value_credit=new_credit)
    new_limit = result['new_limit']

    g_nlm_storage[user_address] = nlm

    return new_store_id, new_limit


def create_bkok_nillion_agent_wrapper(agent_name: str, 
                                      agent_instruction: str,
                                      user_address: str,
                                      debug: bool=False) -> BkokAgent:
    """In low level, it will reuse the cached nlm instance, but the top level agent will be created and destroyed
        every time."""
    def exec_nillion_func(context_variables: dict, credit_score: int, risk_level: int):
        """Get credit score and risk level from previous agent, and store to Nillion to compute."""
        global g_user_storage
        user_address = context_variables.get("user_address", None)
        if user_address is None:
            raise ValueError("User address is required.")
        new_store_id: int = None
        new_limit: int = None
        result_queue = Queue()

        def run_async():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                if user_address in g_user_storage:
                    store_id = g_user_storage[user_address]
                    logger.warning(f"This is the second time, we have already had a store_id: {store_id}")
                    result = loop.run_until_complete(
                        step_nillion_async(
                            credit_score=credit_score,
                            risk_level=risk_level,
                            user_address=user_address,
                            store_id=store_id
                        )
                    )
                else:
                    old_credit = 100
                    old_base_number = 1000
                    logger.warning(f"This is the first time, we don't have any store id")
                    result = loop.run_until_complete(
                        step_nillion_async(
                            credit_score=credit_score,
                            risk_level=risk_level,
                            user_address=user_address,
                            old_credit=old_credit,
                            old_base_number=old_base_number
                        )
                    )
                result_queue.put(result)
            finally:
                loop.close()
            
        thread  = threading.Thread(target=run_async)
        thread.start()
        thread.join()

        if result_queue.empty():
            return "Fail to execute"
        
        result = result_queue.get()
        new_store_id, new_limit = result

        if new_store_id is None:
            return "Fail to execute"
        
        g_user_storage[user_address] = new_store_id

        return f"+ new_store_id: {new_store_id}\n+ new_limit: {new_limit}"

    return create_bkok_agent(
        agent_name=agent_name,
        instructions=agent_instruction,
        functions=[exec_nillion_func],
        ctx_vars={"user_address": user_address},
        debug=debug
    )


async def step_agent_async(url_prefix: str, 
                           wallet_address: str, 
                           last_eval_time_utc: Optional[datetime]=None,
                           debug: bool=False) -> Dict[str, str]:
    """The helper function to step through the agent."""
    bkok_prompt_hub = BkokPromptHub()

    # create agent instance
    credit_agent = create_bkok_agent_wrapper(url_prefix, 
                                              "Web3_Credit_Agent", 
                                              bkok_prompt_hub.credit_agent_instruction("fetch_tx_agent_func"),
                                              last_eval_time_utc=last_eval_time_utc,
                                              debug=debug)
    
    agent_credit_response: AgentResponse = credit_agent.run(
        messages=[{"role": "user", "content": f"Please evaluate the credit of {wallet_address}."}]
    )
    logger.info(f"Credit Agent: {agent_credit_response}")

    risk_agent = create_bkok_agent_wrapper(url_prefix, 
                                             "Web3_Risk_Agent", 
                                             bkok_prompt_hub.risk_agent_instruction("fetch_tx_agent_func"),
                                             last_eval_time_utc=last_eval_time_utc,
                                             debug=debug)
    agent_risk_response: AgentResponse = risk_agent.run(
        messages=[{"role": "user", "content": f"Please evaluate the risk of {wallet_address}."}]
    )
    logger.info(f"Risk Agent: {agent_risk_response}")

    # make a summary, as well as `LLM verify`
    credit_summary_text = " ".join(agent_credit_response.assistant_messages)
    risk_summary_text = " ".join(agent_risk_response.assistant_messages)

    res_content = await credit_agent.create_completion_async(
        messages=bkok_prompt_hub.llm_summary_prompt_messages(
            credit_summary_text, risk_summary_text
        ),
        max_tokens=1024,
    )

    logger.info(f"Summary: {res_content}")

    return {
        "credit_agent_response": credit_summary_text, 
        "risk_agent_response": risk_summary_text, 
        "final_summary": res_content
    }