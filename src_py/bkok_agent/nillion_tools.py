import asyncio
import py_nillion_client as nillion
import os

from py_nillion_client import NodeKey, UserKey
from dotenv import load_dotenv
from nillion_python_helpers import get_quote_and_pay, create_nillion_client, create_payments_config

from cosmpy.aerial.client import LedgerClient
from cosmpy.aerial.wallet import LocalWallet
from cosmpy.crypto.keypairs import PrivateKey

from loguru import logger

home = os.getenv("HOME")
load_dotenv(f"{home}/.config/nillion/nillion-devnet.env")

g_program_id = -1

class NillionManager:
    def __init__(self, user_address: str, wallet_idx: int=0):
        if wallet_idx < 0 or wallet_idx > 9:
            raise ValueError("Invalid wallet index, must be between 0 and 9.")
        self.cluster_id = os.getenv("NILLION_CLUSTER_ID")
        self.grpc_endpoint = os.getenv("NILLION_NILCHAIN_GRPC")
        self.chain_id = os.getenv("NILLION_NILCHAIN_CHAIN_ID")

        self.seed = user_address    # to specify the different client
        self.userkey = UserKey.from_seed(self.seed)
        self.nodekey = NodeKey.from_seed(self.seed)
        self.client = create_nillion_client(userkey=self.userkey, nodekey=self.nodekey)

        payments_config = create_payments_config(self.chain_id, self.grpc_endpoint)
        self.payments_client = LedgerClient(payments_config)
        self.payments_wallet = LocalWallet(
            PrivateKey(bytes.fromhex(os.getenv(f"NILLION_NILCHAIN_PRIVATE_KEY_{wallet_idx}"))),
            prefix="nillion",
        )

        # store the prepared program
        self.program_name = "bkok_eval_math_program"
        self.program_mir_path = f"bkok_eval_math_program/target/{self.program_name}.nada.bin"
        self.program_id = ""
        
        self.party_name = "Party1"

    async def prepare_program(self):
        """Pay for store a program"""
        global g_program_id
        if g_program_id != -1:
            self.program_id = g_program_id
            return
        
        logger.debug(f"--- Preparing program {self.program_name}")
        receipt_store_program = await get_quote_and_pay(
            self.client,
            nillion.Operation.store_program(self.program_mir_path),
            self.payments_wallet,
            self.payments_client,
            self.cluster_id,
        )
        action_id = await self.client.store_program(
            self.cluster_id, self.program_name, self.program_mir_path, receipt_store_program
        )
        program_id = f"{self.client.user_id}/{self.program_name}"
        self.program_id = program_id
        g_program_id = program_id

    async def store_secret_integer(self, secret_value_base_number: int, secret_value_credit: int):
        """Pay for store an integer"""
        logger.debug(f"--- Storing secret old_base_number, old_credit with value {secret_value_base_number}, {secret_value_credit}")
        stored_secret = nillion.NadaValues(
            {
                "old_base_number": nillion.SecretInteger(secret_value_base_number),
                "old_credit": nillion.SecretInteger(secret_value_credit)
            }
        )

        # make permissions
        permissions = nillion.Permissions.default_for_user(self.client.user_id)
        # permissions for computing
        permissions.add_compute_permissions({self.client.user_id: {self.program_id}})

        receipt_store_value = await get_quote_and_pay(
            self.client,
            nillion.Operation.store_values(stored_secret, ttl_days=5),
            self.payments_wallet,
            self.payments_client,
            self.cluster_id,
        )
        store_id = await self.client.store_values(
            self.cluster_id, stored_secret, permissions, receipt_store_value
        )
        return store_id
    
    async def retrieve_secret_integer(self, store_id, secret_name):
        """Pay for retrieve an integer"""
        logger.debug(f"--- Retrieving secret with store_id {store_id}")
        receipt_retrieve = await get_quote_and_pay(
            self.client,
            nillion.Operation.retrieve_value(),
            self.payments_wallet,
            self.payments_client,
            self.cluster_id,
        )
        result_tuple = await self.client.retrieve_value(
            self.cluster_id, store_id, secret_name, receipt_retrieve
        )
        return result_tuple[1].value
    
    async def compute_result(self, credit_score: int, risk_level: int, store_id):
        """Compute the result."""
        # First, we will check the input, we will times 100 manually, so there is limit.
        if credit_score < 0 or credit_score > 100 or risk_level < 0 or risk_level > 10:
            raise ValueError("Invalid input, credit_score [0, 100], risk_level [0, 10].")
        compute_bindings = nillion.ProgramBindings(self.program_id)
        compute_bindings.add_input_party(self.party_name, self.client.party_id)
        compute_bindings.add_output_party(self.party_name, self.client.party_id)

        computation_runtime_secrets = nillion.NadaValues(
            {"credit_score": nillion.SecretInteger(credit_score * 100),
             "risk_level": nillion.SecretInteger(risk_level * 100)}
        )
        receipt_compute = await get_quote_and_pay(
            self.client,
            nillion.Operation.compute(self.program_id, computation_runtime_secrets),
            self.payments_wallet,
            self.payments_client,
            self.cluster_id,
        )
        compute_id = await self.client.compute(
            self.cluster_id,
            compute_bindings,
            [store_id],
            computation_runtime_secrets,
            receipt_compute,
        )

        while True:
            compute_event = await self.client.next_compute_event()
            if isinstance(compute_event, nillion.ComputeFinishedEvent):
                print(f"✅  Compute complete for compute_id {compute_event.uuid}")
                print(f"🖥️  The result is {compute_event.result.value}")
                return compute_event.result.value
            await asyncio.sleep(0.05)
    

async def create_nillion_manager(user_address: str) -> NillionManager:
    nlm = NillionManager(user_address=user_address)
    await nlm.prepare_program()
    return nlm


async def test_main():
    nlm = await create_nillion_manager("0x555")
    new_credit = 100
    new_base_number = 1000
    for i in range(3):
        store_id = await nlm.store_secret_integer(secret_value_base_number=new_base_number, secret_value_credit=new_credit)
        result = await nlm.compute_result(credit_score=85, risk_level=3, store_id=store_id)
        print(f"Result: {result}")
        new_credit = result['new_credit']
        new_base_number = result['new_base_number']


if __name__ == "__main__":
    asyncio.run(test_main())