// components/DetailDialog.tsx
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useIsMerchant } from '../auth/merchant';
import { Payment } from './table'
import { Input } from '../ui/input';

type DetailDialogProps = {
  payment: Payment; // 根据实际数据类型定义
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: 'merchant' | 'user';
};

export default function DetailDialog({ payment, open, onOpenChange, role }: DetailDialogProps):React.ReactNode {
  const isMerchant = useIsMerchant();
  const [amount, setAmount] = React.useState('');
  const refund = ()=>{

  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Details</DialogTitle>
          <DialogDescription>Detailed information of the transaction</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div>
            <strong>ID:</strong> {payment.id}
          </div>
          <div>
            <strong>Status:</strong> {payment.status}
          </div>
          <div>
            <strong>Consumer:</strong> {payment.from}
          </div>
          <div>
            <strong>Merchant:</strong> {payment.to}
          </div>
          <div>
            <strong>Time Left:</strong> {payment.time}
          </div>
          <div>
            <strong>Total Amount:</strong> {payment.totalAmount}
          </div>
          <div>
            <strong>Repaid Amount:</strong> {payment.currentAmount}
          </div>
          {role=="merchant" &&
          <div>
            <strong>amount:</strong> 
            <Input value={amount} // 绑定状态值
              onChange={(e) => setAmount(e.target.value)}>
            </Input>
            <Button onClick={()=>eval(amount)} className='mt-4'>pay</Button>
          </div> }
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">关闭</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
