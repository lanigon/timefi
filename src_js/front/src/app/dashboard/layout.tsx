'use client';

import Navbar from "@/components/navbar/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-between pb-4 w-full">        
      <Navbar />
      {children}
    </div>
  );
}