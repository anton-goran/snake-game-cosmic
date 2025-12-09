import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { GameCanvas } from '@/components/GameCanvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import { ActivePlayer, GameFrame } from '@/lib/mockBackend';
import { Home, Eye, Users, Play } from 'lucide-react';

export default function Watch() {
  const navigate = useNavigate();
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayer | null>(null);
  const [gameFrame, setGameFrame] = useState<GameFrame | null>(null);
  const [loading, setLoading] = useState(true);
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      const players = await api.getActivePlayers();
      setActivePlayers(players);
      setLoading(false);
    };
    fetchPlayers();
  }, []);

  const startWatching = async (player: ActivePlayer) => {
    setSelectedPlayer(player);
    setWatching(true);

    // Start watching game frames
    const frameGenerator = api.watchPlayer(player.id);

    const updateFrame = async () => {
      for await (const frame of frameGenerator) {
        setGameFrame(frame);
        // We'll break after receiving frames to allow stopping
        if (!watching) break;
      }
    };

    updateFrame();
  };

  const stopWatching = () => {
    setWatching(false);
    setSelectedPlayer(null);
    setGameFrame(null);
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
          </div>

          <div className="grid lg:grid-cols-[300px_1fr] gap-6">
            {/* Players List */}
            <Card className="shadow-card h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Active Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading players...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activePlayers.map(player => (
                      <button
                        key={player.id}
                        onClick={() => !watching && startWatching(player)}
                        disabled={watching}
                        className={`w-full text-left p-3 rounded-lg transition-all ${selectedPlayer?.id === player.id
                          ? 'bg-gradient-cosmic text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                          } disabled:opacity-50`}
                      >
                        <div className="font-medium">{player.username}</div>
                        <div className="text-sm opacity-90 flex items-center justify-between">
                          <span>
                            {player.mode === 'pass-through' ? '🌌 Pass-through' : '🧱 Walls'}
                          </span>
                          <span className="font-bold">Score: {player.currentScore}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Watch Area */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-cosmic bg-clip-text text-transparent flex items-center gap-2">
                  <Eye className="w-6 h-6 text-primary" />
                  {selectedPlayer ? `Watching ${selectedPlayer.username}` : 'Spectator Mode'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedPlayer ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Eye className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Select a Player to Watch</h3>
                    <p className="text-muted-foreground">
                      Choose from the active players list to start spectating
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <div className="font-semibold text-lg">{selectedPlayer.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedPlayer.mode === 'pass-through' ? '🌌 Pass-through Mode' : '🧱 Walls Mode'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">
                          {gameFrame?.score || selectedPlayer.currentScore}
                        </div>
                        <div className="text-sm text-muted-foreground">Score</div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      {gameFrame && (
                        <GameCanvas
                          snake={gameFrame.snake}
                          food={gameFrame.food}
                          gridSize={20}
                          gameOver={false}
                        />
                      )}
                    </div>

                    <div className="flex justify-center gap-2">
                      <Button
                        onClick={stopWatching}
                        variant="outline"
                        size="lg"
                      >
                        Stop Watching
                      </Button>
                      <Button
                        onClick={() => navigate('/game')}
                        className="bg-gradient-cosmic"
                        size="lg"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play Yourself
                      </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      🔴 Live gameplay - Updates in real-time
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
