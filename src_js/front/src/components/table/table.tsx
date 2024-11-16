'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
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
import { useAccount } from 'wagmi';
import { useIsMerchant } from '../auth/merchant';

export type Payment = {
  id: number;
  status: 'processing' | 'success' | 'failed';
  to: string;
  consumerAdd: string;
  time: string; // 剩余时间
  totalAmount: number;
  currentAmount: number;
  from: string;
  type: 'merchant' | 'user'; // 添加类型字段
};

export default function DataTable() {
  const { address } = useAccount();
  const isMerchant = useIsMerchant();

  const [merchantData, setMerchantData] = useState<Payment[]>([]);
  const [userData, setUserData] = useState<Payment[]>([]);

  const [merchantPage, setMerchantPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreMerchant, setHasMoreMerchant] = useState(true);
  const [hasMoreUser, setHasMoreUser] = useState(true);

  const [activeTab, setActiveTab] = useState<'merchant' | 'user'>('merchant');
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleRowClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  const fetchData = async (
    page: number,
    pageSize: number
  ): Promise<{ merchantData: Payment[]; userData: Payment[] }> => {
    try {
      const response = await axios.get(
        `/api/transactions?target=${address}`
      );
      console.log(response.data)
      const combinedData: Payment[] = response.data;

      const merchantData: Payment[] = combinedData.filter(
        (item) => item.from == address
      );
      const userData: Payment[] = combinedData.filter(
        (item) => item.from != address
      );

      return { merchantData, userData };
    } catch (error) {
      console.error('加载数据失败', error);
      return { merchantData: [], userData: [] };
    }
  };

  const loadData = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const pageSize = 15;
      const page = activeTab === 'merchant' ? merchantPage : userPage;

      const { merchantData: newMerchantData, userData: newUserData } =
        await fetchData(page, pageSize);

      if (activeTab === 'merchant') {
        if (newMerchantData.length < pageSize) {
          setHasMoreMerchant(false);
        }
        setMerchantData((prevData) => [...prevData, ...newMerchantData]);
        setMerchantPage((prevPage) => prevPage + 1);
      } else {
        if (newUserData.length < pageSize) {
          setHasMoreUser(false);
        }
        setUserData((prevData) => [...prevData, ...newUserData]);
        setUserPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error('加载数据失败', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'merchant') {
      if (merchantData.length === 0) {
        setMerchantPage(1);
        setHasMoreMerchant(true);
        loadData();
      }
    } else {
      if (userData.length === 0) {
        setUserPage(1);
        setHasMoreUser(true);
        loadData();
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (
            (activeTab === 'merchant' && hasMoreMerchant) ||
            (activeTab === 'user' && hasMoreUser)
          ) {
            loadData();
          }
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      }
    );

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [activeTab, hasMoreMerchant, hasMoreUser, isLoading]);

  const dataToRender = activeTab === 'merchant' ? merchantData : userData;

  const columns: ColumnDef<Payment>[] = [
    { accessorKey: 'to', header: 'To' },
    { accessorKey: 'status', header: 'Status' },
  ];

  const table = useReactTable({
    data: dataToRender,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderTable = () => (
    <Table className='bg-white'>
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
                {cell.renderValue() as React.ReactNode}
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
        defaultValue="merchant"
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

          {((activeTab === 'merchant' && !hasMoreMerchant) ||
            (activeTab === 'user' && !hasMoreUser)) && (
            <div className="text-center p-4">no more</div>
          )}

          <div ref={loadMoreRef}></div>

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
