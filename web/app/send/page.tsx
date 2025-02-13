"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Leaderboard from "@/components/RankList"
export default function SendRedEnvelope() {
  const [amount, setAmount] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 这里可以添加发送红包的逻辑
    console.log("发送红包金额:", amount)
  }

  const leaderboardData = [
    { id: 1, name: "张三", score: 1000 },
    { id: 2, name: "李四", score: 950 },
    { id: 3, name: "王五", score: 900},
    { id: 4, name: "赵六", score: 850 },
    { id: 5, name: "钱七", score: 800 },
    { id: 6, name: "孙八", score: 750 },
    { id: 7, name: "周九", score: 700 },
    { id: 8, name: "吴十", score: 650 },
    { id: 9, name: "郑十一", score: 600 },
    { id: 10, name: "王十二", score: 550 },
  ]
  
  return (
    <main
      className="flex min-h-screen flex-row items-center p-12 space-x-6"
      style={{ backgroundImage: 'url(/bg.png)' }}
    >
      <div className="w-full w-2/3 bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <Image src="/placeholder.svg?height=100&width=100" alt="红包" width={100} height={100} className="mx-auto" />
          <h1 className="mt-4 text-3xl text-red-600 font-DynaPuff">Welcome</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              红包金额
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 bg-white border border-red-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            发送红包
          </button>
        </form>
        <Link
          href="/open-red-envelope"
          className="block w-full text-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          查看收到的红包
        </Link>
      </div>
      <div className="w-1/3 bg-gray-100">
        <Leaderboard items={leaderboardData}/>
      </div>
    </main>
  )
}

