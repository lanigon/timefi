"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAccount, useReadContracts } from "wagmi";
import { abi, payfiaddress, merchant } from "@/contracts/payfi";
import { useIsMerchant } from "../auth/merchant";

export default function Index() {
  const {address} = useAccount()
  const isMerchant = useIsMerchant();
  const result = useReadContracts({
    contracts: [{
      address: payfiaddress,
      abi: abi,
      functionName: 'balanceOf',
      args: [
        address as `0x${string}`
      ]
      },
      {
        address: payfiaddress,
        abi: abi,
        functionName: 'merchantMaxLoanLimits',
        args: [
          address as `0x${string}`
        ]
      },
      {
        address: payfiaddress,
        abi: abi,
        functionName: 'merchantCurrentLoans',
        args: [
          address as `0x${string}`
        ]
      }
    ]
  })
  // if(result)console.log(result)
  // const amount = result.data![0].result
  // const max = result.data![1].result
  // const cur = result.data![2].result

  return (
    <div className="flex flex-col items-center py-6 space-y-12">
      <div className="w-full max-w-md bg-blue-100 rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center">
          <span className="text-5xl font-extrabold text-gray-800">42</span>
          <span className="text-xl text-gray-600">USDC</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <Tabs defaultValue="user" className="flex flex-col">
          <TabsList className="flex p-4 border-b border-gray-200">
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
              <div className="text-gray-700">Total Give: 552</div>
              <div className="text-gray-700">Total Back: 55</div>
            </TabsContent>
            <TabsContent value="merchant" className="flex flex-col space-y-4">
              <div className="text-gray-700 "><span className="font-bold">Total limit:</span> <span className="text-gray-500 text-3xl font-bold">23</span></div>
              <div className="text-gray-700"><span>Current loan:</span><span className="text-gray-200">2</span></div>
              <div className="text-gray-700">num: 5</div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
