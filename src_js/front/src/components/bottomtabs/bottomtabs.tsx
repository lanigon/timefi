// components/BottomTabs.tsx
'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Home, Send, ShieldCheck, History } from 'lucide-react';
import DataTable from '../table/table';
import MerchantForm from '../form/merchantform';
import Index from '@/components/index/index';
import Payfi from '../form/payfi';

export default function BottomTabs() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value)}
      className="w-full flex flex-col"
    >
      <div className="flex-1 overflow-auto">
        <TabsContent
          value="home"
          className={`${
            activeTab === 'home' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          } transition-all duration-300`}
        >
          <Index />
        </TabsContent>
        <TabsContent
          value="send"
          className={`${
            activeTab === 'send' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          } transition-all duration-300`}
        >
          <div className="text-center mb-4 font-bold text-4xl">Transfer</div>
          <Payfi />
        </TabsContent>
        <TabsContent
          value="history"
          className={`${
            activeTab === 'history' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          } transition-all duration-300`}
        >
          <div className="text-center font-bold text-4xl mb-4">Transaction History</div>
          <DataTable />
        </TabsContent>
        <TabsContent
          value="merchant"
          className={`${
            activeTab === 'merchant' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          } transition-all duration-300`}
        >
          <div className="text-center font-bold text-4xl mb-4">Apply for Merchant</div>
          <MerchantForm />
        </TabsContent>
      </div>

      <TabsList className="w-full fixed bottom-0 left-0 right-0 bg-gray-50 shadow-md flex justify-around p-2 pt-3">
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
          <History className="w-5 h-5" />
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
