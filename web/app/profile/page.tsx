"use client";

import { ConnectButton } from "@mysten/dapp-kit";
import WealthGod from "@/components/wealthGod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ContractsProvider } from "@/context/contractsProvider";
import { WealthGod as WealthGodItem } from "@/type";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Image from "next/image";
import type { DisplayProfile } from "@/type";
export default function Profile() {
  const { getDisplayProfile } = ContractsProvider();
  const [items, setItems] = useState<WealthGodItem[]>([]);
  const account = useCurrentAccount();
  const [displayProfile, setDisplayProfile] = useState<DisplayProfile | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchData = async () => {
      const displayProfile = await getDisplayProfile();
      console.log("displayProfile", displayProfile);
      console.log("displayProfile.wealthGods", displayProfile?.wealthGods);
      if (displayProfile?.wealthGods) {
        setItems(displayProfile?.wealthGods);
      }
      setDisplayProfile(displayProfile);
    };
    console.log("items", items);
    fetchData();
  }, [account]);

  return (
    <main
      className="flex min-h-screen flex-col p-8"
      style={{ backgroundImage: "url(/bg.png)" }}
    >
      <header className="flex justify-between items-center p-4 bg-red-500 rounded-2xl shadow-md mb-40">
        <div className="flex items-center rounded-full overflow-hidden">
          <Image src="/logo.png" alt="Sui Logo" width={80} height={40} />
        </div>
        <ConnectButton />
      </header>

      <div className="text-center flex justify-center items-center bg-white text-red-600 font-DynaPuff py-4 px-6 rounded-xl shadow-lg mb-10">
      <h2 className="text-2xl">Your WealthGod ！</h2>
      </div>
      {account && displayProfile ? (
        <div className="w-full bg-white text-center justify-center items-center rounded-2xl p-4 font-DynaPuff mb-10">
          <p>name: {displayProfile?.name}</p>
          <p>ClaimAmount: {(displayProfile.claimAmount/1000000000).toFixed(2)}</p>
          <p>SendAmount: {(displayProfile.sendAmount/1000000000).toFixed(2)}</p>

        </div>
      ) : null}

      {/* <div className="flex mb-20">
        <WealthGod items={items} />
      </div> */}

      <div className="flex justify-between ">
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
    </main>
  );
}
