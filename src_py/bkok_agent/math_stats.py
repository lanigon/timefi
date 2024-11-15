# TODO: 首先是把统计txs的代码移动到这里来。之后直接调用这个函数即可。然后是设计新的数学运算、分析方法。同样提供给上层调用。
# 相当于上层调用的调用栈就是：
# - func内部的子函数
#   - 调用统计txs的函数
#   - 调用进行数理统计分析的函数
#   - 返回字符串agent函数结果

from typing import List, Optional
from web3 import Web3
from datetime import datetime
from collections import defaultdict

def step_1_stat_txs(txs: List[dict], 
                    wallet_address: str,
                    last_eval_time: Optional[datetime]=None) -> List[dict]:
    """This function takes a list of transactions and returns a list of dictionaries containing statistical 
    information about the transactions."""
    if last_eval_time is None:
        last_eval_time = datetime(1970, 1, 1, 0, 0, 0)
    tx_addr_mapping = {}
    rt_dicts = []
    if isinstance(txs, str):
        print(txs)
        return f"Error: {txs}"
    for i, tx in enumerate(txs):
        from_addr = tx.get('from')
        to_addr = tx.get('to')
        from_addr = from_addr.lower()
        to_addr = to_addr.lower()

        tx_value = Web3.from_wei(int(tx.get('value')), 'ether')
        # .7f
        tx_value = f"{tx_value:.7f}"
        if tx_value == "0.0000000":
            continue
        
        tx_type = ""
        if i == 0:
            if from_addr == wallet_address:
                tx_addr_mapping[from_addr] = f"WALLET_{i+1}"     # record itself as the first address
                tx_addr_mapping[to_addr] = f"WALLET_{i+2}"     # record the other
                tx_type = "out"
            else:
                tx_addr_mapping[to_addr] = f"WALLET_{i+1}"     # record the other
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

        utc_time = datetime.fromtimestamp(int(tx.get('timeStamp')))
        if utc_time > last_eval_time:
            rt_dict = {
                "from": tx_addr_mapping.get(from_addr, ""),
                "to": tx_addr_mapping.get(to_addr, ""),
                "value": tx_value,
                "time": utc_time,
                "tx_type": tx_type,
            }
            rt_dicts.append(rt_dict)
    return rt_dicts


def step_2_agent_pre_analysis(tx_dicts: List[dict]) -> str:
    """This function takes a list of dictionaries containing transaction information and performs a pre-analysis,
    returning a summary string."""
    # Variables for analysis
    total_inflow = 0.0
    total_outflow = 0.0
    daily_trend = defaultdict(lambda: {'volume': 0, 'total_value': 0.0})
    large_flows = defaultdict(float)
    small_flows = defaultdict(float)
    threshold = 0.1  # Define a threshold to classify large and small transactions
    balance_history = []
    current_balance = 0.0
    
    # Process transactions
    for tx in tx_dicts:
        value = float(tx['value'])
        time: datetime = tx['time']
        tx_type = tx['tx_type']
        
        # Update balance based on transaction type
        if tx_type == 'in':
            total_inflow += value
            current_balance += value
        elif tx_type == 'out':
            total_outflow += value
            current_balance -= value
        
        # Track balance history for volatility analysis
        balance_history.append(current_balance)
        
        # Categorize transaction as large or small
        recipient = tx['to'] if tx_type == 'out' else tx['from']
        if value >= threshold:
            large_flows[recipient] += value
        else:
            small_flows[recipient] += value
        
        # Update daily trend
        date_key = time.date()
        daily_trend[date_key]['volume'] += 1
        daily_trend[date_key]['total_value'] += value

    # Summary of cash flow trend
    liquidity = "active" if total_inflow + total_outflow > 1.0 else "passive"
    trend_summary = f"[Liquidity trend]: {liquidity} with total inflow: {total_inflow:.2f} and outflow: {total_outflow:.2f}."
    
    # Balance volatility analysis
    avg_balance = sum(balance_history) / len(balance_history)
    balance_changes = [abs(balance_history[i] - balance_history[i-1]) for i in range(1, len(balance_history))]
    volatility = sum(balance_changes) / len(balance_changes) if balance_changes else 0
    volatility_summary = f"Average balance: {avg_balance:.2f}, with a volatility of {volatility:.2f}."
    
    # Cash flow categorization
    large_flow_summary = ", ".join([f"{key}: {value:.2f}" for key, value in large_flows.items()])
    small_flow_summary = ", ".join([f"{key}: {value:.2f}" for key, value in small_flows.items()])
    
    # Daily trend summary
    daily_summary = "\n".join([f"{date}: Volume: {data['volume']}, Total Value: {data['total_value']:.2f}"
                               for date, data in daily_trend.items()])

    # Final summary
    summary = (
        f"{trend_summary}\n"
        f"[Balance volatility]: {volatility_summary}\n"
        f"[Large cash flow]: {large_flow_summary}\n"
        f"[Small cash flow]: {small_flow_summary}\n"
        f"[Daily transaction trends]: {daily_summary}"
    )

    return summary