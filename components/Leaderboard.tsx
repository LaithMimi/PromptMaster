
import React from 'react';
import { Round } from '../types';

interface LeaderboardProps {
    round: Round | null;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ round }) => {
  if (!round || round.leaderboard.length === 0) {
    return (
        <div className="animate-fade-in text-center flex flex-col items-center justify-center h-full">
            <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700">
                <h1 className="text-3xl font-bold text-gray-300 mb-4">Leaderboard Unavailable</h1>
                <p className="text-gray-400">
                    No leaderboard data is available for the current round. Play the round to see your name here!
                </p>
            </div>
        </div>
    );
  }

  const leaderboardData = round.leaderboard;

  const getScoreClass = (score: number | null) => {
    if (score === null) return 'text-gray-500';
    if (score >= 90) return 'text-green-300 font-bold';
    if (score >= 75) return 'text-yellow-300';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Leaderboard - {round.name}</h1>
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3">Rank</th>
                <th scope="col" className="px-6 py-3">Player</th>
                <th scope="col" className="px-6 py-3 text-center">Avg Score</th>
                {round.targets.map(target => (
                    <th key={target.id} scope="col" className="px-6 py-3 text-center">T{target.id}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((player) => (
                <tr key={player.rank} className="bg-gray-800/80 border-b border-gray-700 hover:bg-gray-700/60 transition-colors">
                  <td className="px-6 py-4 font-medium text-white text-lg">{player.rank}</td>
                  <td className="px-6 py-4 font-semibold text-white">{player.name}</td>
                  <td className={`px-6 py-4 text-center font-bold text-lg ${getScoreClass(player.averageScore)}`}>
                    {player.averageScore}%
                  </td>
                  {player.scores.map((score, index) => (
                    <td key={index} className={`px-6 py-4 text-center ${getScoreClass(score)}`}>
                      {score ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
