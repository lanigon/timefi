// components/RequestButton.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import useSWR from 'swr';
import { Input } from '@/components/ui/input';
import { useReadContract } from 'wagmi';
import {payfiaddress, abi} from '@/contracts/payfi';

export default function SearchMerchant() {
  const [loading, setLoading] = useState(false);
  
  
  const handleClick = () => {
    setLoading(true);
    try {
      const {data} = useReadContract({
        address: payfiaddress,
        abi: abi,
        functionName: 'getTest',
        args: [
          
        ]
      })
      // 处理响应数据
    } catch (error) {
      console.error('error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Input type="text" placeholder="wallet address" className="w-full p-2 border border-gray-300 rounded-md" />
      <Button onClick={handleClick} disabled={loading} className='mt-6'>
        {loading ? 'querying...' : 'query'}
      </Button>
    </div>
  );
}
