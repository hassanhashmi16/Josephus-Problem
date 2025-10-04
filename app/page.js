'use client'
import { useState, useEffect, useCallback } from 'react';

export default function Home() {
  const [n, setN] = useState(5);
  const [k, setK] = useState(1);
  const [people, setPeople] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize people array
  const initializeGame = useCallback(() => {
    const newPeople = Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      alive: true,
      position: i
    }));
    setPeople(newPeople);
    
    // Calculate all steps
    const allSteps = calculateSteps(n, k);
    setSteps(allSteps);
    setCurrentStep(0);
    setIsPlaying(false);
    setIsComplete(false);
  }, [n,k]);

  // Calculate all elimination steps
  const calculateSteps = (totalPeople, passes) => {
    let tempPeople = Array.from({ length: totalPeople }, (_, i) => ({
      id: i + 1,
      alive: true,
      position: i
    }));
    
    let eliminationSteps = [];
    let currentIndex = 0;
    let aliveCount = totalPeople;
    
    while (aliveCount > 1) {
      // Pass the token M times (skip M people)
      for (let i = 0; i < passes; i++) {
        do {
          currentIndex = (currentIndex + 1) % totalPeople;
        } while (!tempPeople[currentIndex].alive);
      }
      
      // Eliminate the person holding the token
      tempPeople[currentIndex].alive = false;
      aliveCount--;
      
      // Save this step
      eliminationSteps.push({
        eliminatedId: tempPeople[currentIndex].id,
        eliminatedPosition: currentIndex,
        peopleState: tempPeople.map(p => ({ ...p }))
      });
      
      // Move to next alive person (who picks up the token)
      if (aliveCount > 0) {
        do {
          currentIndex = (currentIndex + 1) % totalPeople;
        } while (!tempPeople[currentIndex].alive);
      }
    }
    
    return eliminationSteps;
  };

  // Auto-play animation
  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length && steps.length > 0) {
      setIsPlaying(false);
      setIsComplete(true);
    }
  }, [isPlaying, currentStep, steps.length]);

  // Initialize on mount and when n or k changes
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Get current people state based on step
  const getCurrentPeople = () => {
    if (currentStep === 0 || steps.length === 0) {
      return people;
    }
    return steps[currentStep - 1].peopleState;
  };

  const currentPeople = getCurrentPeople();
  const survivor = currentPeople.find(p => p.alive);

  // Calculate position on circle
  const getCirclePosition = (index, total) => {
    const angle = (index * 360) / total - 90;
    const radius = 140;
    const x = radius * Math.cos((angle * Math.PI) / 180);
    const y = radius * Math.sin((angle * Math.PI) / 180);
    return { x, y };
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Josephus Problem
          </h1>
          <p className="text-zinc-400 text-sm">
            N people sit in a circle. After M passes, eliminate the token holder. Last one standing wins.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_300px] gap-6">
          {/* Main visualization */}
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="relative w-full" style={{ height: '350px' }}>
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="-180 -180 360 360"
                >
                  <circle
                    cx="0"
                    cy="0"
                    r="140"
                    fill="none"
                    stroke="#27272a"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />

                  {currentPeople.map((person) => {
                    const pos = getCirclePosition(person.position, n);
                    const isEliminated = !person.alive;
                    const isSurvivor = isComplete && person.alive;

                    return (
                      <g key={person.id}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="18"
                          fill={
                            isSurvivor
                              ? '#22c55e'
                              : isEliminated
                              ? '#18181b'
                              : '#3f3f46'
                          }
                          stroke={
                            isSurvivor
                              ? '#16a34a'
                              : isEliminated
                              ? '#27272a'
                              : '#52525b'
                          }
                          strokeWidth="2"
                          className="transition-all duration-500"
                        />
                        <text
                          x={pos.x}
                          y={pos.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={isEliminated ? '#3f3f46' : '#fafafa'}
                          fontSize="13"
                          fontWeight="600"
                          className="transition-all duration-500"
                        >
                          {person.id}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={isComplete}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 border border-zinc-700 rounded text-sm font-medium transition"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                onClick={() => {
                  if (currentStep < steps.length) {
                    setCurrentStep(prev => prev + 1);
                  }
                }}
                disabled={isComplete || isPlaying}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 border border-zinc-700 rounded text-sm font-medium transition"
              >
                Next →
              </button>
              <button
                onClick={initializeGame}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-sm font-medium transition"
              >
                ↻ Reset
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Eliminated</span>
                  <span className="text-xl font-bold">{currentStep}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Remaining</span>
                  <span className="text-xl font-bold text-blue-400">
                    {currentPeople.filter(p => p.alive).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Survivor</span>
                  <span className="text-xl font-bold text-green-400">
                    {isComplete && survivor ? `#${survivor.id}` : '—'}
                  </span>
                </div>
              </div>

              {currentStep > 0 && currentStep <= steps.length && !isComplete && (
                <div className="mt-4 pt-4 border-t border-zinc-800 text-sm text-zinc-300">
                  Eliminated: <span className="font-semibold text-red-400">#{steps[currentStep - 1].eliminatedId}</span>
                </div>
              )}

              {isComplete && (
                <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-sm font-semibold text-green-400">
                    Person #{survivor?.id} wins!
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-4">Settings</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <label className="text-zinc-400">People (N)</label>
                    <span className="font-medium">{n}</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="50"
                    value={n}
                    onChange={(e) => setN(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <label className="text-zinc-400">Passes (M)</label>
                    <span className="font-medium">{k}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={k}
                    onChange={(e) => setK(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}