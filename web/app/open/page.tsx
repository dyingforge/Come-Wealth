"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function OpenRedEnvelope() {
  const [isOpened, setIsOpened] = useState(false);
  const [amount, setAmount] = useState("0.00");

  const handleOpen = () => {
    setIsOpened(true);
    // 这里可以添加获取红包金额的逻辑
    setAmount("8.88");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-red-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <Image
            src="/placeholder.svg?height=150&width=150"
            alt="红包"
            width={150}
            height={150}
            className={`mx-auto transition-transform duration-500 ${
              isOpened ? "scale-110" : ""
            }`}
          />
          <h1 className="mt-4 text-3xl font-bold text-red-600">
            {isOpened ? "恭喜发财" : "新年快乐"}
          </h1>
        </div>
        {!isOpened ? (
          <button
            onClick={handleOpen}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            打开红包
          </button>
        ) : (
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">￥{amount}</p>
            <p className="mt-2 text-gray-600">恭喜您获得红包</p>
          </div>
        )}
        <Link
          href="/send-red-envelope"
          className="block w-full text-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          返回发红包
        </Link>
      </div>
    </main>
  );
}
