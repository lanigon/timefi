"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// 表单验证模式
const formSchema = z.object({
  walletAddress: z.string().nonempty("钱包地址不能为空"),
  amount: z
    .number({ invalid_type_error: "请输入有效的数字" })
    .positive("资金量必须为正数"),
  time: z.string().nonempty("时间不能为空"),
  token: z.string().nonempty("请选择 Token"),
  chain: z.string().optional(), // 只有在 Transfer 模式下才会显示
});

type FormData = z.infer<typeof formSchema>;

export default function PaymentForm() {
  const [activeTab, setActiveTab] = useState<"payfi" | "transfer">("payfi");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletAddress: "",
      amount: 0,
      time: "",
      token: "",
      chain: "", // 仅在 Transfer 模式下使用
    },
  });

  async function onSubmit(values: FormData) {
    try {
      alert("提交成功");
      form.reset();
    } catch (error) {
      console.error("提交失败", error);
      alert("提交失败，请稍后重试");
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      {/* Tabs for PayFi and Transfer modes */}
      <Tabs defaultValue="payfi" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="flex justify-center mb-4">
          <TabsTrigger value="payfi">PayFi</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Wallet Address field outside TabsContent, always visible */}
            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Wallet Address</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入钱包地址" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tab-specific content */}
            <TabsContent value="payfi">
              {/* PayFi-specific fields if needed */}
            </TabsContent>

            <TabsContent value="transfer">
              {/* Token selection, only for Transfer mode */}
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Token" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Chain selection, only for Transfer mode */}
            </TabsContent>

            {/* Common fields for both modes */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="请输入资金量"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          <TabsContent value="transfer">
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "processing..." : "提交"}
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
