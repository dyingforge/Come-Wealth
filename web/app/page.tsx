"use client";

import { useEffect, useState } from 'react'
import { ContractsProvider } from '@/context/contractsProvider';
import { useRouter } from 'next/navigation';
import { createProfileTx } from '@/contracts/query';
import { useBetterSignAndExecuteTransaction } from '@/hooks/useBetterTx';
import { ConnectButton} from "@mysten/dapp-kit";
import { queryState } from '@/contracts/query';
import { useCurrentAccount } from '@mysten/dapp-kit';
import Image from 'next/image'

export default function Register() {
  const currentUser = useCurrentAccount();
  const [hasProfile, setHasProfile] = useState(false);
  const router = useRouter();
  const {handleSignAndExecuteTransaction:createProfileHandler} = useBetterSignAndExecuteTransaction({tx:createProfileTx});
  const [name, setName] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      const state = await queryState();
      const userInfo = state.profiles.find((user) => user.owner === currentUser?.address);
      const profileExists = !!userInfo;
      setHasProfile(profileExists);
      
      if (profileExists) {
        router.push('/profile');
      }
      console.log("hasProfile", profileExists);
    };
    fetchData();
  }, [currentUser]);



  const handleCreateProfileClick = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createProfileHandler({ name }).onSuccess(async (result) => {
      router.push('/profile');
    }).execute();
  }

  return (
    
    <main

      className="flex min-h-screen flex-col p-8"
      style={{ backgroundImage: 'url(/bg.png)' }}
    >
      
      <header className="flex justify-between items-center p-4 bg-red-500 rounded-2xl shadow-md mb-40">
        <div className="flex items-center rounded-full overflow-hidden">
          <Image src="/logo.png" alt="Sui Logo" width={80} height={40} />
        </div>
        <ConnectButton />
      </header>
    <div className="flex justify-center items-center h-full">
      <div className=" w-full max-w-md justify-center items-center  bg-white rounded-2xl shadow-xl p-8 space-y-6 bg-red-100">
        <div className="text-center">
          <h1 className="mt-4 text-3xl font-DynaPuff text-red-600">Welcome</h1>
          <h2 className="mt-4 text-2xl font-DynaPuff text-red-400">Start your luck !</h2>
        </div>

        <form className="space-y-4" onSubmit={handleCreateProfileClick}>
          <div className="flex justify-start">
            <div className="flex items-end">
              <label htmlFor="username" className="text-xl font-DynaPuff text-gray-700">
                name:
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="ml-2 px-3 py-1 border border-black border-2 rounded-md w-1/2"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-DynaPuff text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Register
          </button>
        </form>
      </div>
      </div>
    </main>
  )
}

