"use client"

import { ConnectButton } from "@mysten/dapp-kit"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ContractsProvider } from "@/context/contractsProvider"
import { queryWealthGods } from "@/contracts/query"
import type { WealthGod as WealthGodItem } from "@/type"
import { useCurrentAccount } from "@mysten/dapp-kit"
import WealthGod from "@/components/wealthGod"
import Image from "next/image"
import type { DisplayProfile } from "@/type"
import { Modal } from "@/components/Modal"
import { useBetterSignAndExecuteTransaction } from "@/hooks/useBetterTx"
import { createProfileTx } from "@/contracts/query"
import { Coins, Gift, Send, User } from "lucide-react"

export default function Profile() {
  const { getDisplayProfile } = ContractsProvider()
  const [filteredWealthGods, setFilteredWealthGods] = useState<WealthGodItem[]>([])
  const account = useCurrentAccount()
  const [displayProfile, setDisplayProfile] = useState<DisplayProfile>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { handleSignAndExecuteTransaction: createProfileHandler } = useBetterSignAndExecuteTransaction({
    tx: createProfileTx,
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const profile = await getDisplayProfile()
        setDisplayProfile(profile)
         console.log(displayProfile)
        if (!profile) {
          setIsModalOpen(true)
        }

        const wealthGods = await queryWealthGods()
        const filteredWealthGods = wealthGods
          .filter((wealthGod: WealthGodItem) => wealthGod.sender === account?.address)
          
        setFilteredWealthGods(filteredWealthGods ?? [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    if (account) {
      fetchData()
    }
  }, [account])

  const handleCreateProfile = async (name: string) => {
    createProfileHandler({ name })
      .onSuccess(async () => {
        const profile = await getDisplayProfile()
        setDisplayProfile(profile)
        setIsModalOpen(false)
      })
      .execute()
  }

  return (
    <main
      className="flex min-h-screen flex-col bg-center"
      style={{ backgroundImage: "url(/bg.png)" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-red-500/95 backdrop-blur-sm shadow-lg p-4 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full overflow-hidden">
                     <Image src="/logo.png" alt="Sui Logo" width={80} height={40} />
            </div>
            <h1 className="text-white text-xl font-bold hidden sm:block" style={{ fontFamily: "DynaPuff, cursive" }}>
              WealthGod
            </h1>
          </div>
          <ConnectButton />
        </div>
      </header>

      <div className="container mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : account && displayProfile ? (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "DynaPuff, cursive" }}>
                Welcome to Your WealthGod!
              </h2>
              <p className="text-red-100">Manage your wealth and share prosperity</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-red-100 p-4 border-b border-red-200">
                <h3
                  className="text-red-600 text-lg font-semibold flex items-center gap-2"
                  style={{ fontFamily: "DynaPuff, cursive" }}
                >
                  <User size={20} /> Profile Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 rounded-lg p-4 flex flex-col items-center">
                    <span className="text-red-400 text-sm mb-1">Name</span>
                    <span className="text-red-600 text-xl font-bold" style={{ fontFamily: "DynaPuff, cursive" }}>
                      {displayProfile?.name}
                    </span>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 flex flex-col items-center">
                    <span className="text-red-400 text-sm mb-1 flex items-center gap-1">
                      <Gift size={14} /> Claim Amount
                    </span>
                    <span className="text-red-600 text-xl font-bold" style={{ fontFamily: "DynaPuff, cursive" }}>
                      {(displayProfile.claimAmount / 1000000000).toFixed(2)} SUI
                    </span>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 flex flex-col items-center">
                    <span className="text-red-400 text-sm mb-1 flex items-center gap-1">
                      <Send size={14} /> Send Amount
                    </span>
                    <span className="text-red-600 text-xl font-bold" style={{ fontFamily: "DynaPuff, cursive" }}>
                      {(displayProfile.sendAmount / 1000000000).toFixed(2)} SUI
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* WealthGod Items */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-red-100 p-4 border-b border-red-200">
                <h3
                  className="text-red-600 text-lg font-semibold flex items-center gap-2"
                  style={{ fontFamily: "DynaPuff, cursive" }}
                >
                  <Coins size={20} /> Your WealthGods
                </h3>
              </div>
              <div className="p-4">
                {filteredWealthGods.length > 0 ? (
                 <div className="border-2 border-red-500 rounded-lg p-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   <WealthGod items={filteredWealthGods} reverse={false} />
                 </div>
               </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>You don't have any WealthGods yet.</p>
                    <p className="mt-2">Send or claim some to get started!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/open"
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg text-white font-bold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
                style={{ fontFamily: "DynaPuff, cursive" }}
              >
                <Gift size={20} />
                <span>Claim</span>
              </Link>
              <Link
                href="/send"
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white border-2 border-red-500 rounded-xl shadow-lg text-red-600 font-bold hover:bg-red-50 transition-all transform hover:scale-105"
                style={{ fontFamily: "DynaPuff, cursive" }}
              >
                <Send size={20} />
                <span>Send</span>
              </Link>
            </div>
          </div>
        ) : (
          <Modal isOpen={isModalOpen} onSubmit={handleCreateProfile} />
        )}
      </div>
    </main>
  )
}
