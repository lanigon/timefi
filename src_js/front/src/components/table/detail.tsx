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

export default function DetailDialog({ payment, open, onOpenChange }) {
  const isMerchant = useIsMerchant();
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
            <strong>From:</strong> {payment.from}
          </div>
          <div>
            <strong>To:</strong> {payment.to}
          </div>
          <div>
            <strong>Consumer Address:</strong> {payment.consumerAdd}
          </div>
          <div>
            <strong>Time:</strong> {payment.time}
          </div>
          <div>
            <strong>Total Amount:</strong> {payment.totalAmount}
          </div>
          <div>
            <strong>Current Amount:</strong> {payment.currentAmount}
          </div>
          {isMerchant && <Button>pay</Button>}
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
