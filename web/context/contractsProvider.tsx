"use client";

import { queryProfile,queryState,queryWealthGods } from '@/contracts/query'
import { DisplayProfile,WealthGod } from '@/type'
import { useState,  } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";

export function ContractsProvider() {
  const [, setHasProfile] = useState(false);
  const currentUser = useCurrentAccount();

  const getState = async () => {
    const state = await queryState();
    return state;
  };

  //查找当前用户的profile
  const fetchState = async () => {
        const state = await getState();
        const userInfo = state.profiles.find((user) => user.owner === currentUser?.address);
        setHasProfile(!!userInfo);
        if (currentUser && (userInfo as any)?.id) {
          const profile = await queryProfile((userInfo as any).id);
            console.log(profile)
            let displayProfile = ({
              id: profile.id,
              name: profile.name,
              sendAmount: profile.sendAmount,
              claimAmount: profile.claimAmount,
              wealthGods:[]
            })as DisplayProfile
            return displayProfile;
        }
    };
 

  //查找所有财富神
  const getWealthGods = async () => {
    const wealthGods = await queryWealthGods() as WealthGod[];
    return wealthGods;
  };

  //查找当前用户的信息
  const getDisplayProfile = async () => {
    const wealthGods = await getWealthGods();
    let displayProfile = await fetchState();
    wealthGods.forEach(async (wealthGod) => {
      if(displayProfile?.id){
        if(wealthGod.sender = displayProfile.id){
         displayProfile.wealthGods.push(wealthGod);
        }
      }
    }) as unknown as  DisplayProfile;
    return displayProfile;
  };

  return {
    getDisplayProfile,
    getWealthGods,
    getState,
  };
}

