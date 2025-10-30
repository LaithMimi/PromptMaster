import React from 'react';
import { Round } from '../types';

interface LobbyProps {
  onPlay: () => void;
  round: Round | null;
  currentUser: string | null;
}

const Lobby: React.FC<LobbyProps> = ({ onPlay, round, currentUser }) => {
  if (!round) {
    return (
      <div className="animate-fade-in text-center flex flex-col items-center justify-center gap-8 h-full">
        <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700">
          <h1 className="text-3xl font-bold text-gray-300 mb-4">Welcome to Prompt Perfect!</h1>
          <p className="text-gray-400">
            There is no active round right now. Please wait for an administrator to create and start a new round.
          </p>
        </div>
      </div>
    );
  }

  const topPlayers = round.leaderboard.slice(0, 3);

  return (
    <div className="animate-fade-in text-center flex flex-col items-center justify-center gap-8">
      <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-700">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 mb-2">
          {round.name}
        </h1>
        <p className="text-gray-400 mb-6">Round ends on {round.deadline}</p>
        
        <p className="max-w-2xl mx-auto text-gray-300 mb-8">
          Welcome, <span className="font-bold text-indigo-300">{currentUser}!</span> Your mission is to write prompts to recreate the target images as closely as possible. Your generated images will be scored for similarity. Are you up for the challenge?
        </p>

        <button 
          onClick={onPlay}
          className="bg-indigo-600 text-white font-bold text-lg px-12 py-4 rounded-lg shadow-lg hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105"
        >
          Play the Current Round
        </button>
      </div>

      {topPlayers.length > 0 && (
         <div className="max-w-4xl w-full">
          <h2 className="text-2xl font-bold mb-4 text-gray-200">Top Players</h2>
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-xl border border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-6">
            {topPlayers.map((player, index) => (
              <div key={player.rank} className={`p-4 rounded-lg flex items-center gap-4 ${index === 0 ? 'bg-yellow-500/10' : 'bg-gray-700/50'}`}>
                <span className={`text-3xl font-bold ${index === 0 ? 'text-yellow-400' : 'text-gray-400'}`}>{player.rank}</span>
                <div>
                  <p className="font-semibold text-white">{player.name}</p>
                  <p className="text-sm text-gray-300">Avg Score: {player.averageScore}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;