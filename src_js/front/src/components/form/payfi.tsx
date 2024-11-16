"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import{payfiaddress, abi, merchant} from "@/contracts/payfi";
import { useWriteContract } from "wagmi";

// 表单验证模式
const formSchema = z.object({
  walletAddress: z.string().nonempty("钱包地址不能为空"),
  amount: z
    .number({ invalid_type_error: "请输入有效的数字" })
    .positive("资金量必须为正数"),
  days: z
    .number({ invalid_type_error: "请输入有效的天数" })
    .int("请输入整数")
    .positive("天数必须为正数")
    .optional(),
  token: z.string().nonempty("请选择 Token"),
});

type FormData = z.infer<typeof formSchema>;

export default function PaymentForm() {
  const [activeTab, setActiveTab] = useState<"payfi" | "transfer">("payfi");
  const {writeContract, writeContractAsync} = useWriteContract()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletAddress: "",
      amount: 0,
      days: undefined, // 仅在 PayFi 模式下使用
      token: "",
    },
  });

  async function onSubmit(values: FormData) {
    const errors = form.formState.errors;

    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors)
        .map((error) => error.message)
        .join("\n");
      alert(`error:\n${errorMessages}`);
      return;
    }

    try {
      console.log(values)
      await writeContractAsync({
        address: payfiaddress,
        abi: abi,
        functionName: "lendToMerchant",
        args: [values.walletAddress, values.amount, values.days],
      })
      alert("success");
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
            {/* Wallet Address field */}
            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet Address</FormLabel>
                  <FormControl>
                    <Input placeholder="wallet address" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <TabsContent value="payfi">
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Token" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDC">USDC</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="total USDC amount"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="days"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="transfer">
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Token" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDC">USDC</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="amount"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </TabsContent>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "processing..." : "process"}
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
