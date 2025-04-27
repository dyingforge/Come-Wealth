"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePopup } from "@/context/PopupProvider"
import WealthGod from "@/components/wealthGod"
import Leaderboard from "@/components/RankList"
import { queryAllProfile } from "@/contracts/query"
import { ContractsProvider } from "@/context/contractsProvider"
import type { WealthGod as WealthGodItem, LeaderboardItem } from "@/type"
import { claimWealthGodTx,getUserProfileCoin } from "@/contracts/query"
import { useBetterSignAndExecuteTransaction } from "@/hooks/useBetterTx"
import { ConnectButton } from "@mysten/dapp-kit"
import Image from "next/image"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { isValidSuiAddress } from "@mysten/sui/utils"
import { ArrowLeft, Gift, Send, Trophy, User } from "lucide-react"
import { get } from "node:http"

export default function OpenRedEnvelope() {
  const { getWealthGods, getDisplayProfile,getAllProfiles } = ContractsProvider()
  const account = useCurrentAccount()
  const { showPopup } = usePopup()
  const [items, setItems] = useState<WealthGodItem[]>([])
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { handleSignAndExecuteTransaction: claimWealthGod } = useBetterSignAndExecuteTransaction({
    tx: claimWealthGodTx,
  })

  const handleClaimClick = async (index: number) => {
    try {
      const coins = await getUserProfileCoin(account?.address ?? "")
      const userProfile = await getDisplayProfile()
      const coin = coins.filter((coin) => coin.type.split('::').pop() === items[index].coin_type.fields.name.split('::').pop())
      const coinId = coin[0]?.id;
      if (account?.address && isValidSuiAddress(account?.address)) {
        claimWealthGod({
          wealthGod: items[index].id.id,
          user: userProfile?.id.id ?? "",
          sender: account?.address,
          amount: items[index].coin?.value ?? 0,
          in_coin: coinId,
          coin_type: coins[0]?.type,
        })
          .onSuccess(async () => {
            const wealthGods = await getWealthGods();
            getAllProfiles();
            setItems((prevItems) =>
              prevItems.map((item, idx) =>
                idx === index ? { ...item, claimAmount: wealthGods[index].claimAmount, isclaimed: true } : item
              ),
            )
            showPopup(() => {}, () => {}, "Blessing claimed successfully! 🎉")
          })
          .onError((error) => {
            console.error("Error claiming blessing:", error)
            showPopup(() => {}, () => {}, "Failed to claim blessing. Please try again.")
          })
          .execute()
      }
    } catch (error) {
      console.error("Error in handleClaimClick:", error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch profiles and wealth gods
        const profiles = await getAllProfiles()
        const wealthGods = await getWealthGods()

        // Filter unclaimed wealth gods and prepare leaderboard data
        const filteredWealthGods = wealthGods
          .filter((wealthGod) => !wealthGod.isclaimed)
    
        setItems(filteredWealthGods)

        // Set leaderboard data sorted by claim amount
        setLeaderboardData(
          profiles
            ?.map((profile) => ({
              id: profile.id.id,
              name: profile.name,
              amount: profile.claimAmount,
            }))
            .sort((a, b) => b.amount - a.amount),
        )
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

  const handleOpen = (index: number) => {
    showPopup(
      () => {
        handleClaimClick(index)
      },
      () => {
        console.log("Claim cancelled")
      },
      "Do you want to claim this blessing?",
    )
  }

  return (
    <main
      className="flex min-h-screen flex-col bg-cover bg-center bg-fixed"
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
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            <Link
              href="/send"
              className="flex items-center gap-1 py-2 px-4 bg-white rounded-lg shadow-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
              style={{ fontFamily: "DynaPuff, cursive" }}
            >
              <Send size={16} />
              <span className="hidden sm:inline">Send</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-1 py-2 px-4 bg-white rounded-lg shadow-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
              style={{ fontFamily: "DynaPuff, cursive" }}
            >
              <User size={16} />
              <span className="hidden sm:inline">Profile</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blessings to Claim */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-red-100 p-4 border-b border-red-200">
              <h2
                className="text-red-600 text-lg font-semibold flex items-center gap-2"
                style={{ fontFamily: "DynaPuff, cursive" }}
              >
                <Gift size={20} /> Available Blessings
              </h2>
            </div>

            <div className="p-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                </div>
              ) : items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <WealthGod items={items} handleOpen={handleOpen} reverse={true} />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Gift size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No blessings available</p>
                  <p>All blessings have been claimed or none have been sent yet.</p>
                  <Link
                    href="/send"
                    className="mt-6 inline-flex items-center gap-2 py-2 px-4 bg-red-100 rounded-lg text-red-600 hover:bg-red-200 transition-colors"
                    style={{ fontFamily: "DynaPuff, cursive" }}
                  >
                    <Send size={16} />
                    <span>Send a Blessing</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-red-100 p-4 border-b border-red-200">
              <h2
                className="text-red-600 text-lg font-semibold flex items-center gap-2"
                style={{ fontFamily: "DynaPuff, cursive" }}
              >
                <Trophy size={20} /> Claim Leaderboard
              </h2>
            </div>

            <div className="p-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                </div>
              ) : leaderboardData.length > 0 ? (
                <Leaderboard items={leaderboardData} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No leaderboard data</p>
                  <p>Leaderboard is empty or no claims have been made yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
