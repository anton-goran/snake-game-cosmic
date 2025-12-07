import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockBackend, LeaderboardEntry } from '@/lib/mockBackend';
import { Home, Trophy, Zap, Medal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await mockBackend.getLeaderboard();
      setLeaderboard(data);
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  const filterByMode = (mode: 'pass-through' | 'walls' | 'all') => {
    if (mode === 'all') return leaderboard;
    return leaderboard.filter(entry => entry.mode === mode);
  };

  const renderLeaderboard = (entries: LeaderboardEntry[]) => {
    const topEntries = entries.slice(0, 50);

    return (
      <div className="space-y-2">
        {topEntries.map((entry, index) => (
          <div
            key={entry.id}
            className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
              index < 3
                ? 'bg-gradient-cosmic text-primary-foreground'
                : 'bg-card hover:bg-muted'
            }`}
          >
            <div className="flex-shrink-0 w-12 text-center">
              {index === 0 && <Trophy className="w-6 h-6 mx-auto text-yellow-400" />}
              {index === 1 && <Medal className="w-6 h-6 mx-auto text-gray-300" />}
              {index === 2 && <Medal className="w-6 h-6 mx-auto text-amber-600" />}
              {index > 2 && <span className="font-bold text-lg">#{index + 1}</span>}
            </div>

            <div className="flex-1">
              <div className="font-semibold">{entry.username}</div>
              <div className={`text-sm ${index < 3 ? 'opacity-90' : 'text-muted-foreground'}`}>
                {entry.mode === 'pass-through' ? '🌌 Pass-through' : '🧱 Walls'}
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold">{entry.score}</div>
              <div className={`text-xs ${index < 3 ? 'opacity-90' : 'text-muted-foreground'}`}>
                {new Date(entry.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-3xl bg-gradient-cosmic bg-clip-text text-transparent flex items-center gap-3">
                <Trophy className="w-8 h-8 text-primary" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading leaderboard...
                </div>
              ) : (
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="all">
                      All Modes
                    </TabsTrigger>
                    <TabsTrigger value="pass-through">
                      <Zap className="w-4 h-4 mr-2" />
                      Pass-through
                    </TabsTrigger>
                    <TabsTrigger value="walls">
                      <Trophy className="w-4 h-4 mr-2" />
                      Walls
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    {renderLeaderboard(filterByMode('all'))}
                  </TabsContent>

                  <TabsContent value="pass-through">
                    {renderLeaderboard(filterByMode('pass-through'))}
                  </TabsContent>

                  <TabsContent value="walls">
                    {renderLeaderboard(filterByMode('walls'))}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
