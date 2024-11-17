// components/DetailDialog.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useIsMerchant } from '../auth/merchant';
import { Payment } from './table'; 
import { Input } from '../ui/input';
import { Progress } from '@/components/ui/progress';
import { useAccount, useChainId, useWriteContract } from 'wagmi';
import { payfiaddress, abi, layeradd } from '@/contracts/payfi';


type DetailDialogProps = {
  payment: Payment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: 'merchant' | 'user';
};

export default function DetailDialog({
  payment,
  open,
  onOpenChange,
  role,
}: DetailDialogProps): JSX.Element {
  const { address } = useAccount()
  const [isLoading, setisLoading] = useState(false)
  const isMerchant = useIsMerchant();
  const [amount, setAmount] = useState(0)
  const progressPercentage = (payment.repaidAmount / payment.amount) * 100;
  const {writeContract, writeContractAsync} = useWriteContract()
  const chainid = useChainId()
  const handlePay = async() => {
    if(payment.status !== 'processing') {
      alert("Loan is not processing")
      return
    }
    setisLoading(true)
    writeContractAsync({
      address: chainid == 11155111? payfiaddress: layeradd,
      abi,
      functionName: 'repayLoan',
      args: [address, payment.loanId, BigInt(amount*10**6)],
    })
    setisLoading(false)
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Details</DialogTitle>
          <DialogDescription>Detailed information of the transaction</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div>
            <strong>ID:</strong> {payment.loanId}
          </div>
          <div>
            <strong>Status:</strong> {payment.status}
          </div>
          <div>
            <strong>Buyer:</strong> {payment.buyer}
          </div>
          <div>
            <strong>Merchant:</strong> {payment.merchant}
          </div>
          <div>
            <strong>Time Left:</strong> {payment.time}
          </div>
          <div>
            <strong>Total Amount:</strong> {payment.amount/10**6}
          </div>
          <div>
            <strong>Repaid Amount:</strong> {payment.repaidAmount/10**6}
          </div>
          <div>
            <strong>Repayment Progress:</strong>
            <Progress value={progressPercentage} className="mt-2" />
            <span className="text-sm text-gray-600">{progressPercentage.toFixed(2)}%</span>
          </div>
          {role === 'merchant' && (
            <div>
              <strong className='mb-2'>Amount to Pay:</strong>
              <Input
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount to repay"
              />
              <Button onClick={handlePay} className="mt-4">
                {isLoading ? 'Paying...' : 'Pay'}
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
