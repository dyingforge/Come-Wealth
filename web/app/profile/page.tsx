"use client";

import { ConnectButton } from '@mysten/dapp-kit'
import WealthGod from "@/components/wealthGod";
import Link from "next/link";
import { useEffect, useState } from 'react';
import { usePopup } from "@/context/PopupProvider";
import { ContractsProvider } from "@/context/contractsProvider";
import { WealthGod as WealthGodItem } from '@/type';
import { useCurrentAccount } from '@mysten/dapp-kit'
import Navi_bar from '@/components/Navi_bar'


export default function Profile() {
  const { getDisplayProfile } = ContractsProvider();
  const { showPopup } = usePopup();
  const [items, setItems] = useState<WealthGodItem[]>([]);
  const  account  = useCurrentAccount();
  useEffect(() => {
    const fetchData = async () => {
      const displayProfile = await getDisplayProfile();
    console.log("displayProfile",displayProfile)
    console.log("displayProfile.wealthGods",displayProfile?.wealthGods)
    if (displayProfile?.wealthGods) {
        setItems(displayProfile?.wealthGods);
    }
    };
    console.log("items",items)
    fetchData();
  }, [account]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between p-8"
      style={{ backgroundImage: "url(/bg.png)" }}
    >
      <Navi_bar />

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
        <WealthGod items={items} />
      </div>
    </main>
  );
}

