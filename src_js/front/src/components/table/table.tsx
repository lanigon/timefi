// components/Index.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import DetailDialog from './detail';
import axios from 'axios';
import { useAccount, useChainId, useReadContract } from 'wagmi';
import { useIsMerchant } from '../auth/merchant';
import { layeradd, abi } from '@/contracts/payfi';

export type Payment = {
  loanId: number;
  amount: number;
  repaidAmount: number;
  isRepaid: boolean;
  dueDate: number;
  buyer: string;
  merchant: string;
  type: string;
  status: string;
  time: string; 
};

const shortenAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function DataTable() {
  const { address } = useAccount();
  const isMerchant = useIsMerchant();
  const chainId = useChainId();

  const [merchantData, setMerchantData] = useState<Payment[]>([]);
  const [userData, setUserData] = useState<Payment[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'merchant' | 'user'>('user');

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleRowClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  const calculateRemainingTime = (dueDate: number): string => {
    const currentTime = Date.now() / 1000;
    const remainingSeconds = dueDate - currentTime;
    if (remainingSeconds <= 0) {
      return 'Expired';
    }
    const days = Math.floor(remainingSeconds / (3600 * 24));
    const hours = Math.floor((remainingSeconds % (3600 * 24)) / 3600);
    return `${days}d ${hours}h`;
  };
  const { data, isError } = useReadContract({
    address: layeradd,
    abi,
    functionName: 'getTransactions', 
    args: [address]
  });
  console.log(data)
  const fetchData = async (): Promise<{ merchantData: Payment[]; userData: Payment[] }> => {
    try {
      let response;
      if (chainId === 545) { 
        
      } else if (chainId === 80002) { 
        response = await axios.get(`/api/transactionsPoly?target=${address}`);
        console.log(response)
      } else{
        response = await axios.get(`/api/transactions?target=${address}`);
      }
      const combinedData: Payment[] = response!.data;

      const processedData = combinedData.map((item) => {
        const currentTime = Date.now() / 1000; // 当前时间（秒）
        let status: 'processing' | 'success' | 'failed';

        if (item.isRepaid) {
          status = 'success';
        } else if (currentTime > item.dueDate) {
          status = 'failed';
        } else {
          status = 'processing';
        }

        return {
          ...item,
          type:
            item.merchant.toLowerCase() === address?.toLowerCase()
              ? 'merchant'
              : 'user',
          status: status,
          time: calculateRemainingTime(item.dueDate),
        };
      });

      const merchantData: Payment[] = processedData.filter(
        (item) => item.type === 'merchant'
      );
      const userData: Payment[] = processedData.filter(
        (item) => item.type === 'user'
      );

      return { merchantData, userData };
    } catch (error) {
      console.error('error', error);
      return { merchantData: [], userData: [] };
    }
  };

  const loadData = async () => {
    setIsLoading(true);

    try {
      const { merchantData: newMerchantData, userData: newUserData } = await fetchData();

      setMerchantData(newMerchantData);
      setUserData(newUserData);
    } catch (error) {
      console.error('error', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dataToRender = activeTab === 'merchant' ? merchantData : userData;

  const columns: ColumnDef<Payment>[] = React.useMemo(() => {
    if (activeTab === 'merchant') {
      return [
        { accessorKey: 'loanId', header: 'ID' },
        {
          accessorKey: 'buyer',
          header: 'User',
          cell: ({ getValue }) => shortenAddress(getValue() as string),
        },
        { accessorKey: 'status', header: 'Status' },
      ];
    } else {
      return [
        { accessorKey: 'loanId', header: 'ID' },
        {
          accessorKey: 'merchant',
          header: 'Merchant',
          cell: ({ getValue }) => shortenAddress(getValue() as string),
        },
        { accessorKey: 'status', header: 'Status' },
      ];
    }
  }, [activeTab]);

  const table = useReactTable({
    data: dataToRender,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderTable = () => (
    <Table className="bg-white">
      <TableHeader>
        <TableRow>
          {table.getFlatHeaders().map((header) => (
            <TableHead key={header.id}>
              {header.isPlaceholder
                ? null
                : (header.column.columnDef.header as React.ReactNode)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            onClick={() => handleRowClick(row.original)}
            className="cursor-pointer hover:bg-gray-100"
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-4">
      <Tabs
        defaultValue="user" // 将默认值改为 'user'
        onValueChange={(value) => setActiveTab(value as 'merchant' | 'user')}
      >
        <TabsList className="flex mb-4">
          {isMerchant && (
            <TabsTrigger value="merchant" className="flex-1 text-center">
              Merchant
            </TabsTrigger>
          )}
          <div className="w-px bg-gray-300 mx-2 h-6 self-center" />
          <TabsTrigger value="user" className="flex-1 text-center">
            User
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {renderTable()}

          {isLoading && <div className="text-center p-4">loading...</div>}

          {selectedPayment && (
            <DetailDialog
              payment={selectedPayment}
              open={isDetailOpen}
              onOpenChange={(open: boolean) => setIsDetailOpen(open)}
              role={activeTab}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
