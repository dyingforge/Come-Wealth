"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Leaderboard from "@/components/RankList";
import { queryAllProfile } from "@/contracts/query";
import { LeaderboardItem } from "@/type";
import { ContractsProvider } from "@/context/contractsProvider";
import {
  ConnectButton,
} from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { createWealthGodTx } from "@/contracts/query";
import { useBetterSignAndExecuteTransaction } from '@/hooks/useBetterTx';
import { isValidSuiAddress } from "@mysten/sui/utils";

export default function SendRedEnvelope() {
  const  account  = useCurrentAccount();
  const { getDisplayProfile, userProfile } = ContractsProvider();
  const { handleSignAndExecuteTransaction:createWealthGod } = useBetterSignAndExecuteTransaction({tx:createWealthGodTx});
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const [description, setDescription] = useState("God bless you !");
  
  const handleCreateWealthGod = async () => {
    if (account?.address && isValidSuiAddress(account?.address)) {
      createWealthGod({ description: description, user: userProfile?.id.id??'', sender: account?.address }).execute();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const profiles = await queryAllProfile();
      console.log("Fetched profiles:", profiles); // 查看返回的数据
      const profile = await getDisplayProfile();
      console.log("profile",profile);
      if (profiles.length === 0) {
        console.error("No profiles found!");
      }

      setLeaderboardData(
        profiles?.map((profile) => ({
          id: profile.id.id,
          name: profile.name,
          amount: Number(profile.sendAmount), 
        }))
      );
      console.log("Leaderboard Data:", leaderboardData); // 确保数据更新
    };
    fetchData();
  }, [account]);

  return (
    <main
      className="flex min-h-screen flex-col p-8"
      style={{ backgroundImage: "url(/bg.png)" }}
    >
      <header className="flex justify-between items-center p-4 bg-red-500 rounded-2xl shadow-md mb-20">
        <div className="flex items-center rounded-full overflow-hidden">
          <Image src="/logo.png" alt="Sui Logo" width={80} height={40} />
        </div>
        <ConnectButton />
      </header>

      <div className="flex justify-between items-center h-full space-x-1">
        <div className="w-1/2 p-2 justify-start  ">
          <div className="flex justify-between items-start mb-4">
            <Link
              href="/open"
              className="text-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-m font-DynaPuff text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Claim
            </Link>
            <Link
              href="/profile"
              className="py-2 px-4 border border-red-300 rounded-md shadow-sm text-m font-DynaPuff text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Profile
            </Link>
          </div>

          <div className="w-full bg-white rounded-2xl p-4">
            <div className="text-center py-4 ">
              <h1 className="text-[20px] text-red-600 font-DynaPuff">
                Begin to pary for blessing !
              </h1>
              <Image
                src="/god.png"
                alt="红包"
                width={140}
                height={100}
                className="mx-auto mt-2 rounded-lg"
              />
            </div>
            <form>
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-DynaPuff text-gray-700"
                >
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)} // 更新 description
                  className="mt-1 w-full rounded-md border-red-500 bg-red-100 text-black font-DynaPuff shadow-sm test-xs"
                />
              </div>
              <button
                type="button" // 不需要 type="submit"，改为 type="button"
                className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-DynaPuff text-white bg-red-600 hover:bg-red-700 "
                onClick={handleCreateWealthGod} // 直接调用 handleCreateWealthGod
              >
                Send 1 Sui
              </button>
            </form>
          </div>
        </div>
        <div className="">
          <Leaderboard items={leaderboardData} />
        </div>
      </div>
    </main>
  );
}
