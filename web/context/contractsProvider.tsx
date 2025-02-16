"use client";

import { queryProfile,queryState,queryWealthGods,queryWealthGod } from '@/contracts/query'
import { DisplayProfile,WealthGod } from '@/type'
import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";

export function ContractsProvider() {
  const [hasProfile, setHasProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<DisplayProfile>();
  const currentUser = useCurrentAccount();


  //查找当前用户的profile
  const getDisplayProfile = async () => {
        const state = await queryState();
        const userInfo = state.profiles.find((user) => user.owner === currentUser?.address);
        console.log("userInfo", userInfo);
        setHasProfile(!!userInfo);
        if (userInfo?.id) {
          const profile = await queryProfile(userInfo?.id);

            const displayProfile = ({
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
            setUserProfile(displayProfile);
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
    hasProfile,
    userProfile
  };
}

