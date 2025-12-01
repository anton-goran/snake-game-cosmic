import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Trophy, Eye, Zap } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
              Cosmic Snake Arena
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose your adventure in the space
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-glow-primary transition-all duration-300 border-primary/30 group"
              onClick={() => navigate('/game')}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <Gamepad2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Play Snake</CardTitle>
                <CardDescription>
                  Start a new game and challenge yourself
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    Pass-through mode
                  </span>
                  <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm">
                    Walls mode
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-glow-secondary transition-all duration-300 border-secondary/30 group"
              onClick={() => navigate('/leaderboard')}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
                  <Trophy className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-2xl">Leaderboard</CardTitle>
                <CardDescription>
                  Check top scores and rankings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  See how you stack up against other cosmic players
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-[0_0_20px_hsl(var(--neon-pink)/0.5)] transition-all duration-300 border-accent/30 group"
              onClick={() => navigate('/watch')}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-2xl">Watch Others</CardTitle>
                <CardDescription>
                  Spectate live games from other players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Learn strategies by watching the best
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-cosmic border-0 text-primary-foreground">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Quick Stats</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Your gaming profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="opacity-90">Games Played:</span>
                  <span className="font-bold">Coming Soon</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">Best Score:</span>
                  <span className="font-bold">Coming Soon</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">Rank:</span>
                  <span className="font-bold">Coming Soon</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-gradient-cosmic hover:opacity-90 transition-opacity text-lg px-8"
              onClick={() => navigate('/game')}
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              Start Playing Now
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
