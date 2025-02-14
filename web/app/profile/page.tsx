"use client";

import WealthGod from "@/components/wealthGod";
import Link from "next/link";

export default function Profile() {
  const mockItems = [
    {
      description: "good lucky",
      sender: "0x8f5C8b7A1b7c2E9eF8b4d4A1D7A8B907b1F24561",
      claimAmount: 8.88,
      isOpened: false,
    },
    {
      description: "good lucky",
      sender: "0x2A4F3b7A8D7c2E1eF9B1c2D6A0C2b1D4A2E8C3F3",
      claimAmount: 5.0,
      isOpened: false,
    },
    {
      description: "good lucky",
      sender: "0xD5D8b7A8D5E3D9F5F8F1D9A8D8F9A1C8F5D2D7B6",
      claimAmount: 10.0,
      isOpened: false,
    },
    {
      description: "good lucky",
      sender: "0xA1B2c3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0",
      claimAmount: 3.5,
      isOpened: false,
    },
    {
      description: "good lucky",
      sender: "0x4E5C8A1B2D3C4E6F7D8F9A1D2B8A3C9D5A1E7F6",
      claimAmount: 12.99,
      isOpened: false,
    },
    {
      description: "good lucky",
      sender: "0x3F7C8A9B6D5F1E9C7D2F0E4A6D3E5F7C8A2D7F1",
      claimAmount: 6.66,
      isOpened: false,
    },
  ];

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between p-8"
      style={{ backgroundImage: "url(/bg.png)" }}
    >
      <div className="text-center flex bg-white text-red-600 font-DynaPuff py-4 px-6 rounded-xl shadow-lg">
        <h2 className="text-2xl">Your WealthGod ！</h2>
      </div>

      <div className="flex w-1/2 justify-between items-center">
        <Link
          href="/open"
          className="text-center py-3 px-5 border border-red-300 rounded-lg shadow-lg text-lg font-DynaPuff text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Claim
        </Link>
        <Link
          href="/send"
          className="py-3 px-5 border border-red-300 rounded-lg shadow-lg text-lg font-DynaPuff text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Send
        </Link>
      </div>
      
      <div className="flex">
        <WealthGod items={mockItems} />
      </div>
    </main>
  );
}
