import React, { useState, useMemo } from 'react';
import { Role, Attempt, Round } from '../types';
import TargetCard from './TargetCard';

interface PlayScreenProps {
  role: Role;
  round: Round | null;
  currentUser: string | null;
  attempts: Record<number, Attempt>;
  onAttemptComplete: (targetId: number, attemptData: Omit<Attempt, 'targetId'>) => void;
}

const PlayScreen: React.FC<PlayScreenProps> = ({ role, round, currentUser, attempts, onAttemptComplete }) => {
  const [showGroundTruth, setShowGroundTruth] = useState(false);
  const isAdmin = role === Role.ADMIN;
  
  const completedCount = useMemo(() => Object.keys(attempts).length, [attempts]);
  const averageScore = useMemo(() => {
    if (completedCount === 0) return 0;
    const totalScore = Object.values(attempts).reduce((sum: number, attempt: Attempt) => sum + attempt.score, 0);
    return Math.round(totalScore / completedCount);
  }, [attempts, completedCount]);
  
  if (!round) {
    return (
        <div className="animate-fade-in text-center flex flex-col items-center justify-center h-full">
            <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700">
                <h1 className="text-3xl font-bold text-gray-300 mb-4">No Active Round</h1>
                <p className="text-gray-400">
                    There is currently no round to play. Please visit the Lobby or wait for an admin to start a new one.
                </p>
            </div>
        </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="animate-fade-in text-center flex flex-col items-center justify-center h-full">
        <p>Please sign in to play.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 mb-6 sticky top-20 z-40 flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-700">
        <div>
          <h1 className="text-2xl font-bold">{round.name}</h1>
          <p className="text-sm text-gray-400">Recreate the 5 target images by writing the perfect prompt.</p>
        </div>
        <div className="flex items-center gap-4">
            {isAdmin && round.isFinished && (
                <div className="flex items-center space-x-2 bg-pink-500/20 p-2 rounded-lg">
                    <span className="text-sm font-medium text-pink-300">Show Ground Truth</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={showGroundTruth} onChange={() => setShowGroundTruth(!showGroundTruth)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                </div>
            )}
            <div className="text-center bg-gray-700/50 p-3 rounded-lg">
                <p className="font-bold text-xl text-white">{completedCount} / 5</p>
                <p className="text-xs text-gray-400">Completed</p>
            </div>
            <div className="text-center bg-gray-700/50 p-3 rounded-lg">
                <p className="font-bold text-xl text-indigo-400">{averageScore}%</p>
                <p className="text-xs text-gray-400">Avg. Score</p>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {round.targets.map(target => (
          <TargetCard
            key={target.id}
            target={target}
            attempt={attempts[target.id] || null}
            onAttemptComplete={onAttemptComplete}
            isAdmin={isAdmin}
            showGroundTruth={showGroundTruth}
          />
        ))}
      </div>
    </div>
  );
};

export default PlayScreen;