'use client';

import Navbar from "@/components/navbar/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col pb-4 w-full justify-start bg-[#F0F6FC]">        
      <Navbar />
      <div className="mt-16">
        {children}
      </div>
      <div className="text-center w-full flex items-center h-full">
        <p className="text-[#9CA3AF] font-bold text-center ml-6">
          Support Your Favorite Cafe to Get Free Coffee
        </p>
      </div>
    </div>
  );
}