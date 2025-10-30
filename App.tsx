import React, { useState, useCallback, useEffect } from 'react';
import { View, Role, Round, Attempt, LeaderboardEntry } from './types';
import Header from './components/Header';
import Lobby from './components/Lobby';
import PlayScreen from './components/PlayScreen';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import LoginScreen from './components/LoginScreen';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [view, setView] = useState<View>(View.LOBBY);
  const [role, setRole] = useState<Role>(Role.PLAYER);
  const [round, setRound] = useState<Round | null>(null);
  const [attempts, setAttempts] = useState<Record<number, Attempt>>({});

  const handleLogin = (name: string) => {
    const trimmedName = name.trim();
    setCurrentUser(trimmedName);
    if (trimmedName.toLowerCase() === 'laith mimi') {
      setRole(Role.ADMIN);
    } else {
      setRole(Role.PLAYER);
    }
    setAttempts({}); // Reset attempts for the new user session
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setRole(Role.PLAYER); // Reset role on logout
    setView(View.LOBBY);
  };

  const handleCreateRound = useCallback((newRoundData: Omit<Round, 'id' | 'leaderboard' | 'isFinished'>) => {
    const newRound: Round = {
      ...newRoundData,
      id: `round-${Date.now()}`,
      leaderboard: [],
      isFinished: false,
    };
    setRound(newRound);
    setView(View.LOBBY);
    setAttempts({}); // Reset attempts for everyone when a new round is created
  }, []);

  const handleAttemptComplete = useCallback((targetId: number, attemptData: Omit<Attempt, 'targetId'>) => {
    setAttempts(prev => ({
      ...prev,
      [targetId]: { ...attemptData, targetId }
    }));
  }, []);

  useEffect(() => {
    if (!round || !currentUser || !round.targets.length || Object.keys(attempts).length !== round.targets.length) {
      return;
    }

    const userAlreadyOnLeaderboard = round.leaderboard.some(entry => entry.name === currentUser);
    if (userAlreadyOnLeaderboard) {
      return;
    }
    
    const totalScore = Object.values(attempts).reduce((sum, attempt) => sum + attempt.score, 0);
    const averageScore = Math.round(totalScore / round.targets.length);
    const scores = round.targets.map(target => attempts[target.id]?.score ?? null);

    const newEntry: Omit<LeaderboardEntry, 'rank'> = {
      name: currentUser,
      averageScore,
      scores,
    };

    const newLeaderboard = [...round.leaderboard, { ...newEntry, rank: 0 }];
    
    const sortedLeaderboard = newLeaderboard
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    setRound(prevRound => prevRound ? { ...prevRound, leaderboard: sortedLeaderboard } : null);
    
    setView(View.LEADERBOARD);
  }, [attempts, round, currentUser]);

  const renderView = useCallback(() => {
    switch (view) {
      case View.PLAY:
        return <PlayScreen 
                  role={role} 
                  round={round} 
                  currentUser={currentUser}
                  attempts={attempts} 
                  onAttemptComplete={handleAttemptComplete} 
                />;
      case View.LEADERBOARD:
        return <Leaderboard round={round} />;
      case View.ADMIN:
        return <AdminPanel onCreateRound={handleCreateRound} />;
      case View.LOBBY:
      default:
        return <Lobby onPlay={() => setView(View.PLAY)} round={round} currentUser={currentUser} />;
    }
  }, [view, role, round, handleCreateRound, currentUser, attempts, handleAttemptComplete]);

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header 
        currentView={view}
        role={role}
        currentUser={currentUser}
        onNavigate={setView}
        onLogout={handleLogout}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {renderView()}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Prompt Perfect &copy; 2024. A Gemini-powered gaming experience.</p>
      </footer>
    </div>
  );
};

export default App;