import React, { useState, useMemo } from 'react';
import { Round, Target } from '../types';
import { generateImage, generateRandomTarget } from '../services/geminiService';
import { LoadingSpinner, ErrorIcon, WandIcon } from './icons';

interface TargetFormData {
  title: string;
  groundTruthPrompt: string;
  imageUrl: string | null;
  isGenerating: boolean;
  isRandomizing: boolean;
  error: string | null;
}

const initialTargetData = (): TargetFormData => ({
  title: '',
  groundTruthPrompt: '',
  imageUrl: null,
  isGenerating: false,
  isRandomizing: false,
  error: null,
});

const NUM_TARGETS = 5;

interface AdminPanelProps {
  onCreateRound: (roundData: Omit<Round, 'id' | 'leaderboard' | 'isFinished'>) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onCreateRound }) => {
  const [roundName, setRoundName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [targets, setTargets] = useState<TargetFormData[]>(() => Array(NUM_TARGETS).fill(null).map(initialTargetData));
  const [isCreatingRound, setIsCreatingRound] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  const handleTargetChange = (index: number, field: 'title' | 'groundTruthPrompt', value: string) => {
    const newTargets = [...targets];
    newTargets[index][field] = value;
    setTargets(newTargets);
  };

  const handleGenerateImage = async (index: number, promptOverride?: string) => {
    const promptToUse = promptOverride !== undefined ? promptOverride : targets[index].groundTruthPrompt;

    if (!promptToUse) {
        setTargets(prev => prev.map((t, i) => i === index ? { ...t, error: "Prompt is required to generate an image." } : t));
        return;
    }
    
    setTargets(prev => prev.map((t, i) => i === index ? { ...t, isGenerating: true, imageUrl: null, error: null } : t));

    try {
      const imageUrl = await generateImage(promptToUse);
      setTargets(prev => prev.map((t, i) => i === index ? { ...t, imageUrl, isGenerating: false } : t));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setTargets(prev => prev.map((t, i) => i === index ? { ...t, error: errorMessage, isGenerating: false } : t));
    }
  };
  
  const handleGenerateRandomTarget = async (index: number) => {
    setTargets(prev => prev.map((t, i) => i === index ? { ...initialTargetData(), isRandomizing: true } : t));

    try {
        const { title, groundTruthPrompt } = await generateRandomTarget();
        
        setTargets(prev => prev.map((t, i) => i === index ? { ...t, title, groundTruthPrompt, isRandomizing: false } : t));

        await handleGenerateImage(index, groundTruthPrompt);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate random target.';
        setTargets(prev => prev.map((t, i) => i === index ? { ...t, error: errorMessage, isRandomizing: false } : t));
    }
  };

  const isFormReady = useMemo(() => {
    return roundName && deadline && targets.every(t => t.title && t.groundTruthPrompt && t.imageUrl);
  }, [roundName, deadline, targets]);

  const handleSubmit = async () => {
    if (!isFormReady) {
      setCreationError("Please fill all fields and generate all target images before creating the round.");
      return;
    }
    setCreationError(null);
    setIsCreatingRound(true);

    try {
      const finalTargets: Target[] = targets.map((t, i) => ({
        id: i + 1,
        title: t.title,
        groundTruthPrompt: t.groundTruthPrompt,
        imageUrl: t.imageUrl!,
      }));

      onCreateRound({
        name: roundName,
        deadline,
        targets: finalTargets,
      });

      // Reset form after successful creation
      setRoundName('');
      setDeadline('');
      setTargets(Array(NUM_TARGETS).fill(null).map(initialTargetData));

    } catch (err) {
      setCreationError(err instanceof Error ? err.message : 'An unknown error occurred during round creation.');
    } finally {
      setIsCreatingRound(false);
    }
  };


  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center text-pink-400">Admin Panel: Create New Round</h1>
      
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Round Details</h2>
         <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Round Name</label>
            <input 
              type="text" 
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" 
              placeholder="e.g., Mythical Monsters Mayhem" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
            <input 
              type="text" 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" 
              placeholder="e.g., December 25, 2024"
            />
          </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Round Targets ({NUM_TARGETS})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {targets.map((target, index) => (
            <div key={index} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 space-y-3 flex flex-col">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-pink-400">Target #{index + 1}</h3>
                <button
                    onClick={() => handleGenerateRandomTarget(index)}
                    disabled={target.isRandomizing || target.isGenerating}
                    className="text-xs flex items-center gap-1.5 text-indigo-300 hover:text-indigo-200 disabled:text-gray-500 disabled:cursor-wait transition-colors p-1"
                >
                    <WandIcon className="w-4 h-4" />
                    Generate Random
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Title</label>
                <input 
                  type="text" 
                  value={target.title}
                  onChange={(e) => handleTargetChange(index, 'title', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-xs focus:ring-2 focus:ring-pink-500 focus:border-pink-500" 
                  placeholder="e.g., Crystal Caverns Dragon" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Ground-Truth Prompt</label>
                <textarea 
                  value={target.groundTruthPrompt}
                  onChange={(e) => handleTargetChange(index, 'groundTruthPrompt', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-xs focus:ring-2 focus:ring-pink-500 focus:border-pink-500" 
                  rows={4} 
                  placeholder="A detailed, winning prompt..."
                ></textarea>
              </div>
              <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden text-center p-2 mt-auto">
                {target.isRandomizing ? (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <LoadingSpinner />
                        <span className="text-xs">Coming up with an idea...</span>
                    </div>
                ) : target.isGenerating ? (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <LoadingSpinner />
                        <span className="text-xs">Generating image...</span>
                    </div>
                ) : target.imageUrl ? (
                  <img src={target.imageUrl} alt={`Generated for target ${index + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500">Image will appear here</span>
                )}
              </div>
               {target.error && <p className="text-red-400 text-xs mt-1"><ErrorIcon className="inline w-4 h-4 mr-1" />{target.error}</p>}
              <button
                onClick={() => handleGenerateImage(index)}
                disabled={target.isGenerating || target.isRandomizing || !target.groundTruthPrompt}
                className="w-full text-sm bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {target.isGenerating ? 'Generating...' : target.imageUrl ? 'Re-generate Image' : 'Generate Image'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Finalize Round</h2>
        <p className="text-sm text-gray-400 mb-4">
          Ensure all round details are correct and all 5 target images have been generated. Once created, the round will become live for all players.
        </p>
         {creationError && <p className="text-red-400 text-sm my-2 p-3 bg-red-500/10 rounded-lg"><ErrorIcon className="inline w-5 h-5 mr-2" />{creationError}</p>}
        <button 
          onClick={handleSubmit}
          disabled={!isFormReady || isCreatingRound}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isCreatingRound ? <><LoadingSpinner className="w-5 h-5"/> Creating Round...</> : 'Create and Start Round'}
        </button>
      </div>

    </div>
  );
};

export default AdminPanel;