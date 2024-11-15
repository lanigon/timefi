'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';

export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const isLoggedIn = useIsLoggedIn() 
    const { isConnected, isConnecting } = useAccount();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      // 添加延迟（例如 2 秒）
      const timer = setTimeout(() => {
        if (!isLoggedIn) {
          router.push('/');
        }
        setIsChecking(false);
      }, 2000); // 延迟时间以毫秒为单位

      return () => clearTimeout(timer);
    }, [isLoggedIn, router]);

    if (isChecking || isConnecting) {
      return <div>...</div>;
    }

    if (!isConnected) {
      // 因为在 useEffect 中已经处理了重定向，这里可以选择显示一个提示或返回 null
      return <div></div>;
    }

    return <Component {...props} />;
  };
}
