"use client";

import { queryProfile,queryState,queryWealthGods,queryWealthGod } from '@/contracts/query'
import { DisplayProfile,WealthGod } from '@/type'
import { useState,  } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";

export function ContractsProvider() {
  const [hasProfile, setHasProfile] = useState(false);
  const currentUser = useCurrentAccount();

  const getState = async () => {
    const state = await queryState();
    return state;
  };

  //查找当前用户的profile
  const getDisplayProfile = async () => {
        const state = await getState();
        const userInfo = state.profiles.find((user) => user.owner === currentUser?.address);
        setHasProfile(!!userInfo);
        if (currentUser && (userInfo as any)?.id) {
          const profile = await queryProfile((userInfo as any).id);

            let displayProfile = ({
              id: profile.id,
              name: profile.name,
              sendAmount: profile.sendAmount,
              claimAmount: profile.claimAmount,
              wealthGods:[]
            })as DisplayProfile
            profile.wealthGods.forEach(async (wealthGodid) => {
              const wealthGod = await queryWealthGod(wealthGodid)as unknown as WealthGod;
              displayProfile.wealthGods.push(wealthGod);
            })
            return displayProfile;
        }
    };
 

  //查找所有财富神
  const getWealthGods = async () => {
    const wealthGods = await queryWealthGods() as WealthGod[];
    return wealthGods;
  };

  //查找当前用户的信息


  return {
    getDisplayProfile,
    getWealthGods,
    getState,
    hasProfile
  };
}

