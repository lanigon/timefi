'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core"

import Link from 'next/link';
import Dynamic from '@/components/login/dynemic';

export default function Home() {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    if (isLoggedIn === true) {
      // 用户已登录，重定向到 /dashboard
      router.replace('/dashboard');
    }
    // 如果未登录，不做任何操作
  }, [isLoggedIn, router]);

  if (isLoggedIn === undefined) {
    // 登录状态尚未确定，避免页面闪烁，返回 null 或加载指示器
    return null; // 或者 <div>加载中...</div>
  }

  if (isLoggedIn === true) {
    // 已登录且已重定向，避免渲染主页内容
    return null;
  }

  // 用户未登录，渲染主页内容
  return (
    <div className="flex flex-col w-full items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)]">
      this is introduction
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-center w-full">
        <Dynamic />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <Link href="/dashboard">
          666
        </Link>
      </footer>
    </div>
  );
}
