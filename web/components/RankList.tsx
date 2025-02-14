import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';

// 数据结构定义
interface LeaderboardItem {
  id: string; 
  name: string;
  amount: number;
}

interface LeaderboardProps {
  items: LeaderboardItem[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ items }) => {
  return (
    <div className="w-full bg-white overflow-hidden">
      <h2 className="text-2xl font-DynaPuff text-center py-4 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white">
        RankList
      </h2>
      <ul className="divide-y divide-gray-300 w-full">
        {items.slice(0, 5).map((item, index) => (
          <motion.li
            key={index} 
            className="flex items-center justify-between p-4 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
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
                <span className="text-gray-500  text-[20px] font-DynaPuff ml-2 mr-2">{index + 1}</span>
              )}
            </div>
            <div className="flex-grow ml-1">
              <p className="text-sm font-DynaPuff text-gray-900">{item.name}</p>
              <p className="text-[12px] text-gray-600">{item.id.substring(0, 4) + '...' + item.id.substring(item.id.length - 4)}</p>
              <p className="text-sm font-DynaPuff text-red-600">{item.amount}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
