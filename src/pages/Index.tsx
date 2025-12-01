import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Gamepad2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-2xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
            🐍 Cosmic Snake
          </h1>
          <p className="text-2xl text-muted-foreground">
            The classic snake game reimagined in space
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-lg text-foreground/90">
            Choose between two exciting modes, compete on the leaderboard, and watch other players in action!
          </p>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            size="lg"
            onClick={() => navigate('/login')}
            className="bg-gradient-cosmic hover:opacity-90 transition-opacity text-lg px-8"
          >
            <Gamepad2 className="w-5 h-5 mr-2" />
            Login to Play
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/signup')}
            className="text-lg px-8"
          >
            Create Account
          </Button>
        </div>

        <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="p-4 rounded-lg bg-card border border-border/50">
            <div className="text-primary font-semibold mb-2">🌌 Pass-through Mode</div>
            <div className="text-sm text-muted-foreground">
              Snake wraps around the edges - perfect for longer games
            </div>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border/50">
            <div className="text-secondary font-semibold mb-2">🧱 Walls Mode</div>
            <div className="text-sm text-muted-foreground">
              Hit the walls and you're done - ultimate challenge
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
