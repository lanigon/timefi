// components/BottomTabs.tsx
'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Home, Send, MapPin, Search, ShoppingCart, ShieldCheck,	History } from 'lucide-react';
import DataTable from '../table/table';
import MerchantForm from '../form/merchantform';
import Index from '@/components/index/index';
import Payfi from '../form/payfi';

export default function BottomTabs() {
  return (
    <Tabs defaultValue="home" className="w-full flex flex-col">
      <div className="flex-1 overflow-auto"> 
        <TabsContent value="home">
          <Index />
        </TabsContent>
        <TabsContent value="send">
          <div className='text-center'>Transfer</div>
          <Payfi />
        </TabsContent>
        <TabsContent value="history">
          <div className='text-center'>Transaction History</div>
          <DataTable />
        </TabsContent>
        <TabsContent value="merchant">
          <div className='text-center'>Apply for Merchant</div>
          <MerchantForm />
        </TabsContent>
      </div>
      
      <TabsList className="w-full fixed bottom-0 left-0 right-0 bg-white shadow-md flex justify-around p-2">
        <TabsTrigger
          value="home"
          className="flex flex-col items-center"
          aria-label="Home"
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </TabsTrigger>
        <TabsTrigger
          value="send"
          className="flex flex-col items-center"
          aria-label="Send"
        >
          <Send className="w-5 h-5" />
          <span className="text-xs">Send</span>
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="flex flex-col items-center"
          aria-label="History"
        >
          <	History className="w-5 h-5" />
          <span className="text-xs">History</span>
        </TabsTrigger>
        <TabsTrigger
          value="merchant"
          className="flex flex-col items-center"
          aria-label="Merchant"
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs">KYC</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
