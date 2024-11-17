import Link from "next/link";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

export default function Navbar() {
  return (
    <div className="w-full flex justify-between items-center px-8 pt-3 z-10 pb-2 fixed top-0">
      <Link href="/dashboard"><img src="/favicon.png" alt="logo" className="w-14 h-11" />
      </Link>
      <DynamicWidget />
    </div>
  )
}