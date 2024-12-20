import { useState, useEffect } from 'react';
import { useAccount, useChainId, useReadContract } from 'wagmi';
import { payfiaddress, abi, layeradd } from '@/contracts/payfi';

export function useIsMerchant() {
  const {address} = useAccount();
  const chainid = useChainId();
  const {data} = useReadContract({
    address: chainid == 11155111? payfiaddress: layeradd,
    abi: abi,
    functionName: 'merchantMaxLoanLimits',
    args: [
      address as `0x${string}`
    ]
  })

  return Number(data!)>0?true:false;
}
