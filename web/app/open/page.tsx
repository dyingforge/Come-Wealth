"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { usePopup } from "@/context/PopupProvider";
import WealthGod from "@/components/wealthGod";
import Leaderboard from "@/components/RankList";
import { queryAllProfile } from '@/contracts/query';
import { ContractsProvider } from "@/context/contractsProvider";
import { WealthGod as WealthGodItem, LeaderboardItem } from '@/type';
import { claimWealthGodTx } from '@/contracts/query';
import { useBetterSignAndExecuteTransaction } from '@/hooks/useBetterTx';
import { ConnectButton} from "@mysten/dapp-kit";
import Image from 'next/image'


export default function OpenRedEnvelope() {
  const { getWealthGods } = ContractsProvider();
  const { showPopup } = usePopup();
  const [items, setItems] = useState<WealthGodItem[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const { handleSignAndExecuteTransaction:claimWealthGod } = useBetterSignAndExecuteTransaction({tx:claimWealthGodTx});

  const handleClaimClick = async (wealthGod:string,user:string) => {
    claimWealthGod({ wealthGod: wealthGod, user: user }).onSuccess(async (result) => {
    }).execute();
  }

  useEffect(() => {
    const fetchData = async () => {
      const profiles = await queryAllProfile();
      const wealthGods = await getWealthGods();

      setItems(wealthGods
        .filter((wealthGod) => wealthGod.isclaimed)
        .map((wealthGod) => ({
          id: wealthGod.id,
          amount: wealthGod.amount,
          description: wealthGod.description,
          sender: wealthGod.sender,
          claimAmount: wealthGod.amount,
          isclaimed: false,
        })));

      setLeaderboardData(profiles?.map((profile) => ({
        id: profile.id.id,
        name: profile.name,
        amount: profile.claimAmount,
      })));
    };
    fetchData();
  }, []);

  const handleOpen = (index: number) => {
    console.log(`Opened wealth god at index ${index}`);
    showPopup(
      () => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], isclaimed: true };
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
      className="flex min-h-screen flex-col p-8"
      style={{ backgroundImage: 'url(/bg.png)' }}
    >
      <header className="flex justify-between items-center p-4 bg-red-500 rounded-2xl shadow-md mb-20">
        <div className="flex items-center rounded-full overflow-hidden">
          <Image src="/logo.png" alt="Sui Logo" width={80} height={40} />
        </div>
        <ConnectButton />
      </header>

      <div className="flex justify-between w-full space-x-4">
        <div className="w-1/2 p-2 justify-start  ">
          <div className="flex justify-between items-start mb-4">
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
        <div className="">
          <Leaderboard items={leaderboardData} />
        </div>
      </div>
    </main>
  );
}
