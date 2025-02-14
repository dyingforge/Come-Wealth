"use client";

import { useState } from "react";
import Link from "next/link";
import { usePopup } from "@/context/PopupProvider";
import WealthGod from "@/components/wealthGod";
import Leaderboard from "@/components/RankList";

export default function OpenRedEnvelope() {
  // 假设每个红包有 description, sender 和 amount
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

  const { showPopup } = usePopup();
  const [items, setItems] = useState(mockItems); // 将红包列表存储在状态中

  const handleOpen = (index: number) => {
    console.log(`Opened wealth god at index ${index}`);
    showPopup(
      () => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], isOpened: true };
        setItems(updatedItems);
        console.log("Popup confirmed");
      },
      () => {
        console.log("Popup cancelled");
      }
    );
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center p-6 space-y-10"
      style={{ backgroundImage: "url(/bg.png)" }}
    >
      <div className="flex justify-between w-full space-x-4">
        <div className="w-2/3">
          <div className="flex w-1/2 justify-between items-start mb-4">
            <Link
              href="/send"
              className="text-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-m font-DynaPuff text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Send
            </Link>
            <Link
              href="/profile"
              className="py-2 px-4 border border-red-300 rounded-md shadow-sm text-m font-DynaPuff text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Profile
            </Link>
          </div>

          <div className="text-center">
            <WealthGod items={items} handleOpen={handleOpen} />
          </div>
        </div>
        <div className="w-1/3 bg-gray-100">
          <Leaderboard items={[]} />
        </div>
      </div>
    </main>
  );
}
