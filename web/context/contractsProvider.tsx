"use client";

import { queryProfile,queryState,queryWealthGods,queryAllProfile } from '@/contracts/query'
import { DisplayProfile,WealthGod,Profile } from '@/type'
import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";

export function ContractsProvider() {
  const [hasProfile, setHasProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<DisplayProfile>();
  const [profiles, setProfiles] = useState<Profile[]>();
  const currentUser = useCurrentAccount();


  //查找当前用户的profile
  const getDisplayProfile = async () => {
        const state = await queryState();
        const wealthGods = await queryWealthGods();
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
              wealthGods: []
            }) as DisplayProfile;

         wealthGods.forEach((wealthGod) => {
            if (profile.wealthGods.includes(wealthGod.id.id)) {
              displayProfile.wealthGods.push({
                id: wealthGod.id,
                sender: wealthGod.sender,
                description: wealthGod.description,
                isclaimed: wealthGod.isclaimed,
                 claimAmount: wealthGod.claimAmount,
                send_amount: wealthGod.send_amount,
                coin_type: wealthGod.coin_type,
                coin: wealthGod.coin
              });
            }
          });
            setHasProfile(true);
            setUserProfile(displayProfile);
            return displayProfile as DisplayProfile;
        }
       
      };

      const getAllProfiles = async () => {
        const allProfiles = await queryAllProfile();
        setProfiles(allProfiles);
        return allProfiles;
      };
 

  //查找所有财富神
  const getWealthGods = async () => {
    const wealthGods = await queryWealthGods() as WealthGod[];
    return wealthGods;

  };


  //查找当前用户的信息

  return {
    getDisplayProfile,
    getAllProfiles,
    getWealthGods,
    hasProfile,
    profiles,
    userProfile
  };
}

