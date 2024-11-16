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
        from_addr = tx.get('buyer')
        to_addr = tx.get('merchant')
        from_addr = from_addr.lower()
        to_addr = to_addr.lower()

        tx_value = int(tx.get("amount"))
        
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

        # utc_time = datetime.fromtimestamp(int(tx.get('timeStamp')))
        # if utc_time > last_eval_time:
        rt_dict = {
            "loan_id": tx.get('loanId'),
            "from": tx_addr_mapping.get(from_addr, ""),
            "to": tx_addr_mapping.get(to_addr, ""),
            "value": tx_value,
            "due_time": datetime.fromtimestamp(int(tx.get("dueDate"))),
            "now_time": datetime.now(),
            "tx_type": tx_type,
            "return_amount": tx.get('repaidAmount'),
            "isRepaid": tx.get('isRepaid'),
        }
        rt_dicts.append(rt_dict)
    return rt_dicts


def step_2_agent_pre_analysis(rt_dicts: List[dict]) -> str:
    """分析贷款数据，生成统计和趋势报告"""
    # 初始化变量
    total_loan_amount = 0.0
    total_return_amount = 0.0
    overdue_loans = []
    loan_trends = defaultdict(lambda: {'count': 0, 'total_value': 0.0})
    repaid_status = {"Fully Repaid": 0, "Partially Repaid": 0, "Not Repaid": 0}
    now = datetime.now()

    # 遍历所有贷款记录
    for loan in rt_dicts:
        loan_id = loan["loan_id"]
        loan_value = float(loan["value"])
        return_amount = float(loan["return_amount"] or 0)
        due_time = loan["due_time"]
        is_repaid = loan["isRepaid"]

        # 更新总金额和已还款金额
        total_loan_amount += loan_value
        total_return_amount += return_amount

        # 计算还款状态
        if is_repaid:
            repaid_status["Fully Repaid"] += 1
        elif return_amount > 0:
            repaid_status["Partially Repaid"] += 1
        else:
            repaid_status["Not Repaid"] += 1

        # 检查是否逾期未还清
        if due_time < now and not is_repaid:
            overdue_loans.append({
                "loan_id": loan_id,
                "due_time": due_time,
                "remaining_amount": loan_value - return_amount
            })

        # 更新到期趋势
        date_key = due_time.date()
        loan_trends[date_key]["count"] += 1
        loan_trends[date_key]["total_value"] += loan_value

    # 生成分析报告
    overdue_summary = "\n".join([
        f"Loan ID: {loan['loan_id']}, Due Time: {loan['due_time']}, Remaining Amount: {loan['remaining_amount']:.2f}"
        for loan in overdue_loans
    ]) or "No overdue loans."

    trend_summary = "\n".join([
        f"{date}: Count: {data['count']}, Total Value: {data['total_value']:.2f}"
        for date, data in sorted(loan_trends.items())
    ])

    summary = (
        f"Total Loan Amount: {total_loan_amount:.2f}\n"
        f"Total Return Amount: {total_return_amount:.2f}\n"
        f"Repayment Progress: {(total_return_amount / total_loan_amount) * 100:.2f}%\n"
        f"Repayment Status:\n"
        f"  Fully Repaid: {repaid_status['Fully Repaid']}\n"
        f"  Partially Repaid: {repaid_status['Partially Repaid']}\n"
        f"  Not Repaid: {repaid_status['Not Repaid']}\n"
        f"Overdue Loans:\n{overdue_summary}\n"
        f"Loan Trends by Due Date:\n{trend_summary}"
    )

    return summary