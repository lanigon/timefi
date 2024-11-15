import Link from "next/link";
import Dynamic from "../login/dynemic";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

export default function Navbar() {
  return (
    <div className="w-full flex justify-between pl-8">
      <Link href="/dashboard"><img src="/favicon.webp" alt="logo" className="w-8 h-8" />
       
      </Link>
      <DynamicWidget />
    </div>
  )
}