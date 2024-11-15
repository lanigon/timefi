'use client'

import BottomTabs from "@/components/bottomtabs/bottomtabs";
import { useTelegram } from "@/components/telegram/provider";
import React, { useMemo } from "react";
import {withAuth} from "@/components/auth/auth";

// const Page = () => {
// 	const { webApp } = useTelegram();
// 	const initData = useMemo(() => webApp && webApp.initData, [webApp]);
// 	getUser(initData);
// }

// const getUser = (initData: string) => {
//   return fetcher(null, `${getHost()}/user/info`, {
//     method: "GET",
//     headers: new Headers({
//       "Content-Type": "application/json",
//       Authorization: `tma ${initData}`,
//     }),
//   });
// };

export function New() {
  return (
    <div className="max-w-xl h-screen mx-auto">
      <BottomTabs />
    </div>
  )
}

export default withAuth(New)