"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAccount, useChainId, useWriteContract } from "wagmi";
import { payfiaddress, abi, layeradd } from "@/contracts/payfi";

const formSchema = z.object({
  name: z.string().nonempty("nonempty"),
  email: z.string().email("nonempty"),
  address: z.string().nonempty("nonempty"),
  id_number: z.string().nonempty("nonempty"),
  approve: z.string()
});

export default function MerchantForm() {
  const { address } = useAccount();
  const {writeContract, writeContractAsync} = useWriteContract()
  const chainid = useChainId()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      id_number: "",
      approve: ""
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors)
        .map((error) => error?.message)
        .join("\n");
      alert(`error:\n${errorMessages}`);
      return;
    }

    try {
      const response = await axios.post("/api/merchants", { name: values.name,
        email: values.email,
        address: values.address,
        id_number: values.id_number});

      if(Number(values.approve) != 0){
        await writeContractAsync({
          address: chainid == 11155111? payfiaddress: layeradd,
          abi,
          functionName: "initializeMerchantApproval",
          args: [BigInt(Number(values.approve)*10**6)]
        })
      }
      alert("success");
    } catch (error) {
      console.error("提交失败", error);
      alert("error");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>name</FormLabel>
              <FormControl>
                <Input placeholder="name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>address</FormLabel>
              <FormControl>
                <Input placeholder="address" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="id_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Number</FormLabel>
              <FormControl>
                <Input placeholder="ID number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="approve"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approve</FormLabel>
              <FormControl>
                <Input placeholder="approve" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "submitting..." : "submit"}
        </Button>
      </form>
    </Form>
  );
}
