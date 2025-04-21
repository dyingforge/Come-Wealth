'use client'
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import Leaderboard from "@/components/RankList"
import { queryAllProfile } from "@/contracts/query"
import { LeaderboardItem } from "@/type"
import { ContractsProvider } from "@/context/contractsProvider"
import { ConnectButton } from "@mysten/dapp-kit"
import { usePopup } from "@/context/PopupProvider"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { createWealthGodTx } from "@/contracts/query"
import { useBetterSignAndExecuteTransaction } from "@/hooks/useBetterTx"
import { isValidSuiAddress } from "@mysten/sui/utils"
import {  Gift, Send, Trophy, User } from 'lucide-react'

export default function SendRedEnvelope() {
  const account = useCurrentAccount()
  const { showPopup } = usePopup()
  const { userProfile } = ContractsProvider()
  const { handleSignAndExecuteTransaction: createWealthGod } = useBetterSignAndExecuteTransaction({
    tx: createWealthGodTx,
  })
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([])
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // 获取排行榜数据，避免每次描述改变时触发
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const profiles = await queryAllProfile()

        if (profiles && profiles.length > 0) {
          setLeaderboardData(
            profiles
              .map((profile) => ({
                id: profile.id.id,
                name: profile.name,
                amount: Number(profile.sendAmount),
              }))
              .sort((a, b) => b.amount - a.amount) // Sort by amount in descending order
          )
        }
      } catch (error) {
        console.error("Error fetching profiles:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (account) {
      fetchData()
    }
  }, [account]) 

  const handleCreateWealthGod = async () => {
    if (!description.trim()) {
      showPopup(
        () => {},
        () => {},
        "Please enter a description for your blessing"
      )
      return
    }

    if (account?.address && isValidSuiAddress(account?.address)) {
      setIsSending(true)
      createWealthGod({ description: description, user: userProfile?.id.id ?? "", sender: account?.address })
        .onSuccess(async (result) => {
          showPopup(
            () => {
              console.log("Popup confirmed")
              setDescription("") // Reset description after success
            },
            () => {
              console.log("Popup cancelled")
            },
            "Blessing sent successfully! 🎉"
          )
        })
        .onError((error) => {
          showPopup(
            () => {},
            () => {},
            "Failed to send blessing. Please try again."
          )
          console.error("Error sending blessing:", error)
        })
        .execute()
    }
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
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            <Link
              href="/open"
              className="flex items-center gap-1 py-2 px-4 bg-white rounded-lg shadow-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
              style={{ fontFamily: "DynaPuff, cursive" }}
            >
              <Gift size={16} />
              <span className="hidden sm:inline">Claim</span>
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

          {/* Send Form */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden order-2 lg:order-1">
            <div className="bg-red-100 p-4 border-b border-red-200">
              <h2
                className="text-red-600 text-lg font-semibold flex items-center gap-2"
                style={{ fontFamily: "DynaPuff, cursive" }}
              >
                <Send size={20} /> Send Blessing
              </h2>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <h3
                  className="text-xl text-red-600 mb-3"
                  style={{ fontFamily: "DynaPuff, cursive" }}
                >
                  Begin to pray for blessing!
                </h3>
                <div className="relative w-40 h-40 mx-auto">
                  <Image
                    src="/god.png"
                    alt="Wealth God"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <form className="space-y-5">
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    style={{ fontFamily: "DynaPuff, cursive" }}
                  >
                    Your Blessing Message
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write your blessing message here..."
                    className="w-full px-4 py-3 rounded-lg border-2 border-red-200 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  />
                </div>

                <button
                  type="button"
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg shadow-md text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-colors ${
                    isSending ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  onClick={handleCreateWealthGod}
                  disabled={isSending}
                  style={{ fontFamily: "DynaPuff, cursive" }}
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send 1 SUI</span>
                    </>
                  )}
                </button>

                <div className="text-center text-sm text-gray-500 mt-4">
                  Your blessing will be recorded on the blockchain and can be claimed by others.
                </div>
              </form>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden order-1 lg:order-2">
            <div className="bg-red-100 p-4 border-b border-red-200">
              <h2
                className="text-red-600 text-lg font-semibold flex items-center gap-2"
                style={{ fontFamily: "DynaPuff, cursive" }}
              >
                <Trophy size={20} /> Leaderboard
              </h2>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="text-center text-red-500">Loading leaderboard...</div>
              ) : (
                <Leaderboard items={leaderboardData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
