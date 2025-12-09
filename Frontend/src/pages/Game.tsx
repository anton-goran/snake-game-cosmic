import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { GameCanvas } from '@/components/GameCanvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Play, Pause, RotateCcw, Home, Zap, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Game() {
  const navigate = useNavigate();
  const { mode, setMode } = useGame();
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasStarted, setHasStarted] = useState(false);

  const {
    snake,
    food,
    isPlaying,
    gameOver,
    score,
    gridSize,
    startGame,
    pauseGame,
    resumeGame,
  } = useSnakeGame(mode);

  // Submit score when game is over
  useEffect(() => {
    if (gameOver && score > 0 && user) {
      api.submitScore(score, mode);
      toast({
        title: 'Score Submitted!',
        description: `Your score of ${score} has been saved to the leaderboard.`,
      });
    }
  }, [gameOver, score, mode, user, toast]);

  const handleStart = () => {
    startGame();
    setHasStarted(true);
  };

  const handleRestart = () => {
    startGame();
    setHasStarted(true);
  };

  const togglePause = () => {
    if (isPlaying) {
      pauseGame();
    } else {
      resumeGame();
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-muted"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex gap-2">
              <Button
                variant={mode === 'pass-through' ? 'default' : 'outline'}
                onClick={() => setMode('pass-through')}
                disabled={isPlaying}
                className={mode === 'pass-through' ? 'bg-gradient-cosmic' : ''}
              >
                <Zap className="w-4 h-4 mr-2" />
                Pass-through
              </Button>
              <Button
                variant={mode === 'walls' ? 'default' : 'outline'}
                onClick={() => setMode('walls')}
                disabled={isPlaying}
                className={mode === 'walls' ? 'bg-gradient-cosmic' : ''}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Walls
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            {/* Game Area */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-cosmic bg-clip-text text-transparent">
                  {mode === 'pass-through' ? '🌌 Pass-through Mode' : '🧱 Walls Mode'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <GameCanvas
                  snake={snake}
                  food={food}
                  gridSize={gridSize}
                  gameOver={gameOver}
                />

                <div className="flex gap-2 flex-wrap justify-center">
                  {!hasStarted && (
                    <Button
                      size="lg"
                      onClick={handleStart}
                      className="bg-gradient-cosmic hover:opacity-90"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Game
                    </Button>
                  )}

                  {hasStarted && !gameOver && (
                    <Button
                      size="lg"
                      onClick={togglePause}
                      variant="secondary"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-5 h-5 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Resume
                        </>
                      )}
                    </Button>
                  )}

                  {(hasStarted || gameOver) && (
                    <Button
                      size="lg"
                      onClick={handleRestart}
                      variant="outline"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Restart
                    </Button>
                  )}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Use arrow keys or WASD to move
                </div>
              </CardContent>
            </Card>

            {/* Stats Sidebar */}
            <div className="space-y-4">
              <Card className="bg-gradient-cosmic text-primary-foreground border-0">
                <CardHeader>
                  <CardTitle>Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold">{score}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Game Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Mode</div>
                    <div className="font-medium capitalize">{mode.replace('-', ' ')}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <div className="font-medium">
                      {gameOver ? '💀 Game Over' : isPlaying ? '🎮 Playing' : '⏸️ Paused'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Length</div>
                    <div className="font-medium">{snake.length}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg">How to Play</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2 text-muted-foreground">
                  <p>🎮 Use arrow keys or WASD to move</p>
                  <p>🍎 Eat the pink orbs to grow</p>
                  <p>
                    {mode === 'pass-through'
                      ? '🌌 You can pass through walls'
                      : '🧱 Don\'t hit the walls!'}
                  </p>
                  <p>❌ Don't run into yourself</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
