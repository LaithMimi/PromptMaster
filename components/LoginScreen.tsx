import React, { useState } from 'react';
import { GamepadIcon } from './icons';

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setError('Name must be at least 3 characters long.');
      return;
    }
    setError('');
    onLogin(name.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <form 
          onSubmit={handleSubmit}
          className="bg-gray-800/50 border border-gray-700 shadow-2xl rounded-2xl p-8 space-y-8"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 text-2xl font-bold text-white mb-2">
              <GamepadIcon className="w-10 h-10 text-indigo-400" />
              <span>Prompt Perfect</span>
            </div>
            <p className="text-gray-400">Enter your name to play</p>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Player Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="e.g., PixelMaster"
              autoFocus
            />
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold text-lg py-3 rounded-lg shadow-lg hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={!name.trim()}
          >
            Sign In & Play
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;