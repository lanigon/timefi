import pandas as pd
import requests

url = "http://localhost:3000/api/txs"

filename = "100_account_data.xlsx"

df = pd.read_excel(filename)

complete_str = ""
for i, row in df.iterrows():
    address = row['wallet_address']
    data = {
        "wallet_address": address,
        "chain_id": 10,
        "use_sepolia": True
    }
    response = requests.post(url, json=data)
    res_data = response.json()
    # print(res_data)
    txs_str = ""
    for item in res_data['txs']:
        txs_str += f"From {item['from_wallet']} To {item['to_wallet']}, Amount: {item['amount']}, Timestamp {item['worldtime']}\n"

    complete_str += f"Address: {address}, balance: {res_data['balance']}\n\n"
    complete_str += txs_str
    print(complete_str)

    print("============================\n\n")