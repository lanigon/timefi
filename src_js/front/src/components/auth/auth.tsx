'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';

// 使用泛型为高阶组件添加类型支持
export function withAuth<T extends object>(
  Component: React.ComponentType<T>
): React.FC<T> {
  return function AuthenticatedComponent(props: T) {
    const isLoggedIn = useIsLoggedIn();
    const { isConnected, isConnecting } = useAccount();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        if (!isLoggedIn) {
          router.push('/');
        }
        setIsChecking(false);
      }, 500); // 延迟时间以毫秒为单位

      return () => clearTimeout(timer);
    }, [isLoggedIn, router]);

    if (isChecking || isConnecting) {
      return <div></div>;
    }

    if (!isConnected) {
      // 因为在 useEffect 中已经处理了重定向，这里可以选择显示一个提示或返回 null
      return <div></div>;
    }

    return <Component {...props} />;
  };
}
