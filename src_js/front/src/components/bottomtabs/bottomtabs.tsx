// components/BottomTabs.tsx
'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Home, Send, MapPin, Search, ShoppingCart } from 'lucide-react';
import DataTable from '../table/table';
import SearchMerchant from '../search/search';
import MerchantForm from '../form/merchantform';
import PaymentForm from '../form/payfi';
import Index from '@/components/index/index';
import Payfi from '../form/payfi';

export default function BottomTabs() {
  return (
    <Tabs defaultValue="home" className="w-full flex flex-col">
      {/* 内容区域 */}
      <div className="flex-1 overflow-auto"> 
        <TabsContent value="home">
          <Index />
        </TabsContent>
        <TabsContent value="send">
          <Payfi />
          {/* <RequestButton /> */}
        </TabsContent>
        <TabsContent value="history">
          <DataTable />
        </TabsContent>
        <TabsContent value="query">
          <SearchMerchant />
        </TabsContent>
        <TabsContent value="merchant">
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
          <MapPin className="w-5 h-5" />
          <span className="text-xs">History</span>
        </TabsTrigger>
        <TabsTrigger
          value="query"
          className="flex flex-col items-center"
          aria-label="Query"
        >
          <Search className="w-5 h-5" />
          <span className="text-xs">Query</span>
        </TabsTrigger>
        <TabsTrigger
          value="merchant"
          className="flex flex-col items-center"
          aria-label="Merchant"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-xs">Merchant</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
