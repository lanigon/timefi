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
import { Button } from '@/components/ui/button';

type Payment = {
  status: 'processing' | 'success' | 'failed';
  id: number;
  consumerAdd: string;
  time: string; // remaining time
  totalAmount: number;
  currentAmount: number;
};

// 定义列
const columns: ColumnDef<Payment>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'status', header: 'status' },
  { accessorKey: 'consumerAdd', header: 'address' },
  { accessorKey: 'time', header: 'remaining' },
  { accessorKey: 'totalAmount', header: 'total' },
  { accessorKey: 'currentAmount', header: 'paid' },
  {
    id: 'actions',
    header: 'action',
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleView(row.original)}
        >
          查看
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEdit(row.original)}
        >
          编辑
        </Button>
      </div>
    ),
  },
];

export default function DataTable() {
  const [data, setData] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<'merchant' | 'user'>('merchant'); // 当前选中的 Tab
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // 操作函数
  const handleView = (payment: Payment) => {
    console.log('查看详情：', payment);
  };

  const handleEdit = (payment: Payment) => {
    console.log('编辑：', payment);
  };

  // 模拟获取数据的函数
  const fetchData = async (
    page: number,
    pageSize: number,
    type: 'merchant' | 'user'
  ): Promise<Payment[]> => {
    // 模拟延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    const totalDataCount = 50; // 总数据量
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
        consumerAdd: `0x456${type === 'merchant' ? '' : '-USER'}`,
        time: `剩余时间 ${(startId + i)}`,
        totalAmount: 1000,
        currentAmount: 50,
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4">
      {/* Tab 切换 */}
      <Tabs
        defaultValue="merchant"
        onValueChange={(value) => setActiveTab(value as 'merchant' | 'user')}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="merchant">Merchant</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
        </TabsList>

        {/* Merchant 数据 */}
        <TabsContent value="merchant">
          <Table>
            <TableHeader>
              <TableRow>
                {table.getFlatHeaders().map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{cell.renderValue()}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {isLoading && <div className="text-center p-4">加载中...</div>}

          {!hasMore && <div className="text-center p-4">没有更多数据了</div>}

          <div ref={loadMoreRef}></div>
        </TabsContent>

        {/* User 数据 */}
        <TabsContent value="user">
          {/* 数据直接复用 Merchant 内容 */}
          <Table>
            <TableHeader>
              <TableRow>
                {table.getFlatHeaders().map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{cell.renderValue()}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {isLoading && <div className="text-center p-4">加载中...</div>}

          {!hasMore && <div className="text-center p-4">没有更多数据了</div>}

          <div ref={loadMoreRef}></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
