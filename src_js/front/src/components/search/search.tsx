// components/RequestButton.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import useSWR from 'swr';

const fetcher = (url) => axios.get(url).then((res) => res.data)

export default function SearchMerchant() {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    try {
      // 发起请求，例如调用 API
      const { data, error, isLoading, mutate } = useSWR('/api/merchants', fetcher);
      console.log(data);
      // 处理响应数据
    } catch (error) {
      console.error('请求失败', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Button onClick={handleClick} disabled={loading}>
        {loading ? '请求中...' : '发起请求'}
      </Button>
    </div>
  );
}
