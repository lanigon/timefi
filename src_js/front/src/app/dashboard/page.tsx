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

function Dashboard() {
  return (
    <div className="flex justify-center mt-4 rounded-3xl">
      <div className="bg-gray-100 rounded-3xl shadow-lg w-full max-w-xl min-w-[320px] p-6 overflow-hidden">
        <BottomTabs />
      </div>
    </div>
  )
}


export default withAuth(Dashboard)