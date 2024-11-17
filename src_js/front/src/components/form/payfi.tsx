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
import{payfiaddress, abi, merchant, layeradd} from "@/contracts/payfi";
import { useChainId, useReadContract, useWriteContract } from "wagmi";
import axios from "axios";

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
  const [message, setMessage] = useState("");
  const [loading, setloading] = useState(false);
  const chainid = useChainId()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletAddress: "",
      amount: 0,
      days: 0, 
      token: "TimeUSD",
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
      if(activeTab === "payfi"){
        await writeContractAsync({
          address: chainid == 11155111? payfiaddress: layeradd,
          abi: abi,
          functionName: "lendToMerchant",
          args: [values.walletAddress as `0x${string}`, BigInt(values.amount*10**6), BigInt(values.days!)],
        })
      }
      else{
        await writeContractAsync({
          address: chainid == 11155111? payfiaddress: layeradd,
          abi,
          functionName: "transfer",
          args:[values.walletAddress as `0x${string}`, BigInt(values.amount*10**6)]
        })
      }
    } catch (error) {
      console.error("submit error", error);
      alert(error);
    }
  }

  const handleClick = async() => {
    const add = form.getValues("walletAddress");
    setloading(true)  
    const response = await axios.post("/ai/eval_wallet", {
      wallet_address: add,
      use_sepolia: true
    })
    setloading(false)
    alert(response.data.final_summary+"\n\n"+response.data.credit_agent_response+"\n\n"+response.data.risk_agent_response)
  }
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <Tabs defaultValue="payfi" onValueChange={(value) => setActiveTab(value as "payfi" | "transfer")}>
        <TabsList className="flex justify-center mb-4">
          <TabsTrigger value="payfi">PayFi</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="">
          <FormField
          control={form.control}
          name="walletAddress"
          render={({ field }) => (
          <FormItem>
            <FormLabel>Wallet Address</FormLabel>
            <FormControl>
              <div className="flex items-center">
                <Input
                  placeholder="wallet address"
                  className="flex-grow"
                  {...field}
                />
                {(activeTab === "payfi")&&<Button
                  type="button"
                  onClick={handleClick}
                  className="ml-2"
                >
                  {loading?"loading...": "evaluate"}
                </Button>}
              </div>
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
                          <SelectValue placeholder="TimeUSD" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TimeUSD">TimeUSD</SelectItem>
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
                        placeholder="total TimeUSD amount"
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
                          <SelectValue placeholder="TimeUSD" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TimeUSD">TimeUSD</SelectItem>
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

            <Button type="submit" disabled={form.formState.isSubmitting} className="mt-6">
              {form.formState.isSubmitting ? "processing..." : "process"}
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
