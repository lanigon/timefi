'use client'

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Button } from "../ui/button";
import { useReadContract } from "wagmi";

const usdc = () => {
  const{data} = useReadContract({

  })
  return (
    <div>usdc</div>
  )
}
const QrCode = () => {
  const {qrcodeUri, showQrcodeModal, setShowQrcodeModal} = useDynamicContext()
  setShowQrcodeModal(true)
  console.log("qr"+qrcodeUri)
  console.log("showQrcodeModal"+showQrcodeModal)
  return (
    <>
    <img src={qrcodeUri} />
    {qrcodeUri}332
    </>
  )
}

// 显示自己的地址
export default function Index() {
  return (
    <div className="flex flex-col w-full items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)]">
      <Button>For merchant</Button>
      Total give: 32
      Total back: 55
    </div>
  );
}