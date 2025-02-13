import React from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, Medal } from 'lucide-react';

interface LeaderboardItem {
  id: number;
  name: string;
  score: number;
}

interface LeaderboardProps {
  items: LeaderboardItem[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ items }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <h2 className="text-2xl font-bold text-center py-4 bg-red-600 text-white">排行榜</h2>
      <ul className="divide-y divide-gray-200">
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            className="flex items-center p-4 hover:bg-gray-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex-shrink-0 w-10 text-center">
              {index < 3 ? (
                index === 0 ? (
                  <Trophy className="w-6 h-6 text-yellow-400 mx-auto" />
                ) : index === 1 ? (
                  <Medal className="w-6 h-6 text-gray-400 mx-auto" />
                ) : (
                  <Medal className="w-6 h-6 text-yellow-600 mx-auto" />
                )
              ) : (
                <span className="text-gray-500 font-medium">{index + 1}</span>
              )}
            </div>
            <div className="flex-shrink-0 w-10 h-10 mr-4">
                <User className="w-10 h-10 text-gray-400 bg-gray-200 rounded-full p-2" />
            </div>
            <div className="flex-grow">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-sm font-semibold text-red-600">{item.score} 分</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
