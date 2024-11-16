"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAccount, useReadContract } from "wagmi";
import { abi, payfiaddress } from "@/contracts/payfi";

export default function Index() {
  const {address} = useAccount()
  const {data} = useReadContract({
    address: payfiaddress,
    abi: abi,
    functionName: 'balanceOf',
    args: [
      address
    ]
  })
  console.log(data)
  return (
    <div className="flex flex-col items-center py-6 space-y-12">
      <div className="w-full max-w-md bg-blue-100 rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center">
          <span className="text-5xl font-extrabold text-gray-800">1000</span>
          <span className="text-xl text-gray-600">USDC</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <Tabs defaultValue="user" className="flex flex-col">
          <TabsList className="flex p-4 border-b border-gray-200">
            <TabsTrigger value="merchant" className="">
              Merchant
            </TabsTrigger>
            <TabsTrigger value="user" className="">
              User
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="merchant" className="flex flex-col space-y-4">
              <div className="text-gray-700">Total Give: 32</div>
              <div className="text-gray-700">Total Back: 55</div>
            </TabsContent>

            <TabsContent value="user" className="flex flex-col space-y-4">
              <div className="text-gray-700">Total Give: 32</div>
              <div className="text-gray-700">Total Back: 55</div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
