// components/Index.tsx
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

type Payment = {
  id: number;
  status: 'processing' | 'success' | 'failed';
  to: string;
  consumerAdd: string;
  time: string; // 剩余时间
  totalAmount: number;
  currentAmount: number;
  from: string;
};

export default function DataTable() {
  const [data, setData] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<'merchant' | 'user'>('merchant');
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // 用于控制详情对话框的状态
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 行点击事件，打开详情对话框
  const handleRowClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  // 模拟数据获取函数
  const fetchData = async (
    page: number,
    pageSize: number,
    type: 'merchant' | 'user'
  ): Promise<Payment[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const totalDataCount = 50;
    const startId = (page - 1) * pageSize + 1;
    const endId = Math.min(startId + pageSize - 1, totalDataCount);

    if (startId > totalDataCount) {
      return [];
    }

    const newData: Payment[] = Array.from(
      { length: endId - startId + 1 },
      (_, i) => ({
        id: startId + i,
        status:
          type === 'merchant'
            ? ((startId + i) % 3 === 0
                ? 'processing'
                : (startId + i) % 3 === 1
                ? 'success'
                : 'failed')
            : 'success', // 假设用户 Tab 的数据状态全是 success
        from: `0xFromAddress${startId + i}`, // 保留 'from' 字段用于详情对话框
        to: `0xToAddress${startId + i}`,
        consumerAdd: `0x456${type === 'merchant' ? '' : '-USER'}`,
        time: `剩余时间 ${(startId + i)}`,
        totalAmount: 1000 + i,
        currentAmount: 50 + i,
      })
    );

    return newData;
  };

  const loadData = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const pageSize = 15;
      const newData = await fetchData(page, pageSize, activeTab);

      if (newData.length < pageSize || newData.length === 0) {
        setHasMore(false);
      }

      setData((prevData) => [...prevData, ...newData]);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error('加载数据失败', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 切换 Tab 时重置数据
    setData([]);
    setPage(1);
    setHasMore(true);
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadData();
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
  }, [hasMore, isLoading]);

  // 定义表格列，移除了 'from' 和 'actions' 列
  const columns: ColumnDef<Payment>[] = [
    { accessorKey: 'to', header: 'To' },
    { accessorKey: 'status', header: 'Status' },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // 渲染表格
  const renderTable = () => (
    <Table>
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
          <TabsTrigger value="merchant" className="flex-1 text-center">
            Merchant
          </TabsTrigger>
          <div className="w-px bg-gray-300 mx-2 h-6 self-center" /> {/* 分隔线 */}
          <TabsTrigger value="user" className="flex-1 text-center">
            User
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {renderTable()}

          {isLoading && <div className="text-center p-4">loading...</div>}

          {!hasMore && <div className="text-center p-4">no more</div>}

          <div ref={loadMoreRef}></div>

          {selectedPayment && (
            <DetailDialog
              payment={selectedPayment}
              open={isDetailOpen}
              onOpenChange={(open) => setIsDetailOpen(open)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
