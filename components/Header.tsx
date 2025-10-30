import React from 'react';
import { View, Role } from '../types';
import { GamepadIcon } from './icons';

interface HeaderProps {
  currentView: View;
  role: Role;
  currentUser: string | null;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`}
  >
    {label}
  </button>
);

const Header: React.FC<HeaderProps> = ({ currentView, role, currentUser, onNavigate, onLogout }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <GamepadIcon className="w-8 h-8 text-indigo-400" />
            <span>Prompt Perfect</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <NavButton label="Lobby" isActive={currentView === View.LOBBY} onClick={() => onNavigate(View.LOBBY)} />
            <NavButton label="Play" isActive={currentView === View.PLAY} onClick={() => onNavigate(View.PLAY)} />
            <NavButton label="Leaderboard" isActive={currentView === View.LEADERBOARD} onClick={() => onNavigate(View.LEADERBOARD)} />
            {role === Role.ADMIN && (
                <NavButton label="Admin Panel" isActive={currentView === View.ADMIN} onClick={() => onNavigate(View.ADMIN)} />
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
            {currentUser && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">Welcome, <span className="font-bold text-indigo-300">{currentUser}</span></p>
                <button onClick={onLogout} className="text-xs text-gray-400 hover:text-white hover:underline transition-colors">Sign Out</button>
              </div>
            )}
            {role === Role.ADMIN && (
              <div className="bg-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                ADMIN
              </div>
            )}
        </div>
      </nav>
    </header>
  );
};

export default Header;