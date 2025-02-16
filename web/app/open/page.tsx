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
import { useCurrentAccount } from '@mysten/dapp-kit';
import { isValidSuiAddress } from "@mysten/sui/utils";
export default function OpenRedEnvelope() {
  const { getWealthGods,getDisplayProfile } = ContractsProvider();
  const account = useCurrentAccount();
  const { showPopup } = usePopup();
  const [items, setItems] = useState<WealthGodItem[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const { handleSignAndExecuteTransaction:claimWealthGod } = useBetterSignAndExecuteTransaction({tx:claimWealthGodTx});

  const handleClaimClick = async (index:number) => {
    const userProfile = await getDisplayProfile();
    if (account?.address && isValidSuiAddress(account?.address)) {
      claimWealthGod({ wealthGod: items[index].id.id, user: userProfile?.id.id??'',sender:account?.address}).execute();
    }
    console.log("items",items[index]);
    console.log("userProfile",userProfile?.id.id);
  }

  useEffect(() => {
    const fetchData = async () => {
      const profiles = await queryAllProfile();
      const wealthGods = await getWealthGods();
      console.log("wealthGods", wealthGods);  // 打印 wealthGods 确保数据正确
  
      const filteredWealthGods = wealthGods
        .filter((wealthGod) => !wealthGod.isclaimed)
        .map((wealthGod) => ({
          id: wealthGod.id,
          amount: wealthGod.amount,
          description: wealthGod.description,
          sender: wealthGod.sender,
          claimAmount: wealthGod.amount,
          isclaimed: false,
        }));
  
      console.log("filtered wealthGods", filteredWealthGods);  // 打印过滤后的 wealthGods

      setItems(filteredWealthGods);  // 设置 items
  
  
      // 设置排行榜数据
      setLeaderboardData(
        profiles?.map((profile) => ({
          id: profile.id.id,
          name: profile.name,
          amount: profile.claimAmount,
        }))
      );
    };
  
    fetchData();
  }, []);  // 依赖项为空，表示只在组件挂载时执行一次
  
  

  const handleOpen = (index: number) => {
    console.log(`Opened wealth god at index ${index}`);
    showPopup(
      () => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], isclaimed: true };
        handleClaimClick(index);
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
            <WealthGod items={items} handleOpen={handleOpen}  />
          </div>
        </div>  
        <div className="">
          <Leaderboard items={leaderboardData} />
        </div>
      </div>
    </main>
  );
}
