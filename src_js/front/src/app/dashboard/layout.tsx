'use client';

import Navbar from "@/components/navbar/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col pb-4 w-full justify-start">        
      <Navbar />
      <div className="mt-16">
        {children}
      </div>
    </div>
  );
}