import React, { createContext, useContext, useState } from 'react';

export type GameMode = 'pass-through' | 'walls';

interface GameContextType {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  highScore: number;
  setHighScore: (score: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<GameMode>('pass-through');
  const [highScore, setHighScore] = useState(0);

  return (
    <GameContext.Provider value={{ mode, setMode, highScore, setHighScore }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
