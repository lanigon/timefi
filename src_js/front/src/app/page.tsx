'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core"

import Dynamic from '@/components/login/dynemic';

export default function Home() {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    if (isLoggedIn === true) {
      router.replace('/dashboard');
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn === undefined) {
    return null;
  }

  if (isLoggedIn === true) {
    return null;
  }

  return (
    <div className="flex flex-col w-full items-center justify-items-center 
    min-h-screen font-[family-name:var(--font-geist-sans)] mt-8">
      <img src="/favicon.png" alt="logo" className="w-24 h-20 mb-3" />
      <p className='font-bold text-3xl text-center mb-1'>trust-driven transaction platform</p>
      <p className='mb-16 font-extralight text-xl text-gray-500'>free products for buyers</p>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-center w-full">
        <Dynamic />
      </main>
    </div>
  );
}
