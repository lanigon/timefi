"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { abi, payfiaddress, merchant, layeradd } from "@/contracts/payfi";
import { useIsMerchant } from "../auth/merchant";

export default function Index() {
  const chainid = useChainId()
  const [amount, setAmount] = useState(0);
  const [max, setMax] = useState(0);
  const [cur, setCur] = useState(0);
  const {address} = useAccount()
  const isMerchant = useIsMerchant();
  const {data} = useReadContracts({
    contracts: [{
      address: chainid == 11155111? payfiaddress: layeradd,
      abi: abi,
      functionName: 'balanceOf',
      args: [
        address as `0x${string}`
      ]
      },
      {
        address: chainid == 11155111? payfiaddress: layeradd,
        abi: abi,
        functionName: 'merchantMaxLoanLimits',
        args: [
          address as `0x${string}`
        ]
      },
      {
        address: chainid == 11155111? payfiaddress: layeradd,
        abi: abi,
        functionName: 'merchantCurrentLoans',
        args: [
          address as `0x${string}`
        ]
      }
    ]
  })
  useEffect(() => {
    if (data) {
      setAmount(Number(data[0].result)/10**6)
      setMax(Number(data[1].result)/10**6)
      setCur(Number(data[2].result)/10**6)
    }
  }, [data]);

  return (
    <div className="flex flex-col items-center py-6 space-y-12">
      <div className="w-full max-w-md bg-blue-100 rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center">
          <span className="text-5xl font-extrabold text-gray-800">${parseFloat(amount.toFixed(2))? parseFloat(amount.toFixed(2)) : 0}</span>
          <span className="text-xl text-gray-600">TimeUSD</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <Tabs defaultValue="user" className="flex flex-col">
          <TabsList className="flex p-4 border-b border-gray-200 bg-blue-100">
            {isMerchant && (
                <TabsTrigger value="merchant" className="">
                  Merchant
                </TabsTrigger>
              )}
            <TabsTrigger value="user" className="">
              User
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="user" className="flex flex-col space-y-4">
              <div className="text-gray-500 text-3xl font-bold">Total Give: $0</div>
              <div className="text-gray-500 text-3xl font-bold">Total Back: $0</div>
            </TabsContent>
            <TabsContent value="merchant" className="flex flex-col space-y-4">
              <div className="text-gray-700 ">
                <span className="text-gray-500 text-3xl font-bold">Total limit:   </span> 
                <span className="text-gray-500 text-3xl font-bold">
                  ${parseFloat(max.toFixed(2))}</span>
                </div>
              <div className="text-gray-700">
                <span className="text-gray-500 text-3xl font-bold">Current loan:   </span>
                 <span className="text-gray-500 text-3xl font-bold">
                 ${parseFloat(cur.toFixed(2))}
                </span>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
