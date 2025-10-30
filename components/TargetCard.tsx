
import React, { useState, useEffect } from 'react';
import { Target, Attempt, TargetState } from '../types';
import { scorePrompts, getPromptSuggestions } from '../services/geminiService';
import { LoadingSpinner, ErrorIcon, LightbulbIcon } from './icons';

interface TargetCardProps {
  target: Target;
  attempt: Attempt | null;
  onAttemptComplete: (targetId: number, attemptData: Omit<Attempt, 'targetId'>) => void;
  isAdmin: boolean;
  showGroundTruth: boolean;
}

const TargetCard: React.FC<TargetCardProps> = ({ target, attempt, onAttemptComplete, isAdmin, showGroundTruth }) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [cardState, setCardState] = useState<TargetState>(TargetState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  useEffect(() => {
    if (attempt) {
      setUserPrompt(attempt.userPrompt);
      setScore(attempt.score);
      setFeedback(attempt.feedback);
      setCardState(TargetState.SCORED);
    }
  }, [attempt]);

  const handleSubmitPrompt = async () => {
    if (userPrompt.length < 8) {
      setError('Prompt must be at least 8 characters long.');
      return;
    }
    setError(null);
    setCardState(TargetState.SCORING);
    setSuggestions([]); // Clear suggestions on attempt

    try {
      const { score, feedback } = await scorePrompts(userPrompt, target.groundTruthPrompt);
      setScore(score);
      setFeedback(feedback);
      onAttemptComplete(target.id, { userPrompt, score, feedback });
      setCardState(TargetState.SCORED);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      setCardState(TargetState.ERROR);
      setTimeout(() => {
        if(cardState === TargetState.ERROR) {
          setCardState(TargetState.IDLE);
          setError(null);
        }
      }, 5000);
    }
  };
  
  const handleGetSuggestions = async () => {
    setIsSuggesting(true);
    setSuggestionError(null);
    setSuggestions([]);
    try {
        const suggs = await getPromptSuggestions(target.groundTruthPrompt);
        setSuggestions(suggs);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Could not fetch suggestions.';
        setSuggestionError(errorMessage);
    } finally {
        setIsSuggesting(false);
    }
  };

  const isProcessing = cardState === TargetState.SCORING;

  const getScoreColor = (s: number | null) => {
    if (s === null) return 'text-gray-400';
    if (s >= 90) return 'text-green-400';
    if (s >= 75) return 'text-yellow-400';
    if (s >= 50) return 'text-orange-400';
    return 'text-red-400';
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 border border-gray-700 hover:border-indigo-500/50 hover:shadow-indigo-500/20">
      <div className="relative aspect-square">
        <img src={target.imageUrl} alt={target.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent p-4 flex flex-col justify-end">
          <h3 className="text-lg font-bold text-white shadow-black [text-shadow:0_2px_4px_var(--tw-shadow-color)]">{target.title}</h3>
        </div>
        {isProcessing && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 text-white">
            <LoadingSpinner />
            <span>{cardState}...</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        {score !== null && (
            <div className="mb-4 text-center">
                <p className="text-sm text-gray-400">Your Score</p>
                <p className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}%</p>
            </div>
        )}
       
        {showGroundTruth && (
            <div className="mb-4 p-2 bg-pink-500/10 border-l-4 border-pink-500 text-pink-200 text-xs rounded">
                <p className="font-bold">Ground Truth:</p>
                <p>{target.groundTruthPrompt}</p>
            </div>
        )}
        
        {feedback && (
          <p className="text-xs text-center text-gray-400 mb-2 italic">"{feedback}"</p>
        )}

        {cardState === TargetState.IDLE && (
            <div className="mb-2">
                <button
                    onClick={handleGetSuggestions}
                    disabled={isSuggesting}
                    className="w-full text-xs bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-wait text-gray-300 font-semibold py-1.5 px-3 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                    {isSuggesting ? <><LoadingSpinner className="w-4 h-4" /> Suggesting...</> : <><LightbulbIcon className="w-4 h-4" /> Get Suggestions</>}
                </button>
                {suggestionError && <p className="text-red-400 text-xs mt-1 text-center">{suggestionError}</p>}
                {suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {suggestions.map((sugg, i) => (
                            <button
                                key={i}
                                onClick={() => setUserPrompt(sugg)}
                                className="w-full text-left text-xs p-1.5 bg-indigo-900/50 hover:bg-indigo-900/80 rounded transition-colors text-indigo-200"
                            >
                                "{sugg}"
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )}

        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Describe the image..."
          disabled={isProcessing || cardState === TargetState.SCORED}
          className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors flex-grow resize-none"
          rows={3}
        />
        {error && <p className="text-red-400 text-xs mt-1 animate-pulse"><ErrorIcon className="inline w-4 h-4 mr-1" />{error}</p>}
        
        <button
          onClick={handleSubmitPrompt}
          disabled={isProcessing || cardState === TargetState.SCORED}
          className="w-full mt-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-500 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {cardState === TargetState.SCORED ? 'Scored' : 'Submit & Score'}
        </button>
      </div>
    </div>
  );
};

export default TargetCard;
