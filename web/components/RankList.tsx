import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { LeaderboardItem } from '@/type';

// 数据结构定义
interface LeaderboardProps {
  items: LeaderboardItem[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ items }) => {
  // 按 amount 从大到小排序
  const sortedItems = items
    .map(item => ({
      ...item,
      amount: item.amount / Math.pow(10, 9), // 将 Sui 精度从 10^9 转换为正常的浮动精度
    }))
    .sort((a, b) => b.amount - a.amount); // 按 amount 从大到小排序

  return (
    <div className="w-full bg-white overflow-hidden">
      <h2 className="text-2xl font-DynaPuff text-center py-4 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white">
        RankList
      </h2>
      <ul className="divide-y divide-gray-300 w-full">
        {sortedItems.slice(0, 3).map((item, index) => (
          <motion.li
            key={index}
            className="flex items-center justify-between p-4 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {/* 排名图标 */}
            <div className="text-left">
              {index < 3 ? (
                index === 0 ? (
                  <Trophy className="w-6 h-6 text-yellow-400" />
                ) : index === 1 ? (
                  <Medal className="w-6 h-6 text-gray-400" />
                ) : (
                  <Medal className="w-6 h-6 text-yellow-600" />
                )
              ) : (
                <span className="text-gray-500 text-[20px] font-DynaPuff ml-2 mr-2">{index + 1}</span>
              )}
            </div>

            {/* 文字信息 */}
            <div className="flex-grow ml-1 flex flex-col">
              <p className="text-sm font-DynaPuff text-gray-900">name: {item.name}</p>
              <p className="text-sm font-DynaPuff text-red-600">amount: {item.amount.toFixed(2)}</p>
              <p className="text-[10px] font-DynaPuff text-gray-500 break-all w-full">
                id: {item.id}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
