import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { payfiaddress, abi } from '@/contracts/payfi';

export function useIsMerchant() {
  const {address} = useAccount();
  const {data} = useReadContract({
    address: payfiaddress,
    abi: abi,
    functionName: 'merchantMaxLoanLimits',
    args: [
      address as `0x${string}`
    ]
  })

  return data!>0?true:false;
}
