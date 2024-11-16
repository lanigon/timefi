import Link from "next/link";
import Dynamic from "../login/dynemic";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

export default function Navbar() {
  return (
    <div className="w-full flex justify-between px-8 pt-4 z-10 fixed top-0">
      <Link href="/dashboard"><img src="/favicon.webp" alt="logo" className="w-8 h-8" />
      </Link>
      <DynamicWidget />
    </div>
  )
}