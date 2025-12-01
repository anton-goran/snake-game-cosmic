/**
 * Mock Backend Service
 * Centralized module for all backend interactions
 * Everything is simulated with localStorage and mock data
 */

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  mode: 'pass-through' | 'walls';
  timestamp: number;
}

export interface ActivePlayer {
  id: string;
  username: string;
  currentScore: number;
  mode: 'pass-through' | 'walls';
}

export interface GameFrame {
  snake: { x: number; y: number }[];
  food: { x: number; y: number };
  score: number;
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
}

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user storage
const STORAGE_KEY_USER = 'snake_game_user';
const STORAGE_KEY_LEADERBOARD = 'snake_game_leaderboard';

/**
 * Authentication
 */
export const mockBackend = {
  // Login user
  async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    await delay();
    
    // Simple validation
    if (!email || !password) {
      return { user: null, error: 'Email and password are required' };
    }

    // For demo purposes, any email/password combination works
    // In real app, would check against database
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: email.split('@')[0],
      email,
    };

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return { user, error: null };
  },

  // Sign up new user
  async signup(email: string, password: string, username: string): Promise<{ user: User | null; error: string | null }> {
    await delay();
    
    if (!email || !password || !username) {
      return { user: null, error: 'All fields are required' };
    }

    if (username.length < 3) {
      return { user: null, error: 'Username must be at least 3 characters' };
    }

    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
    };

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return { user, error: null };
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    const userStr = localStorage.getItem(STORAGE_KEY_USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Logout
  async logout(): Promise<void> {
    await delay(100);
    localStorage.removeItem(STORAGE_KEY_USER);
  },

  /**
   * Leaderboard
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    await delay();
    
    const stored = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
    let leaderboard: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];

    // If empty, generate mock data
    if (leaderboard.length === 0) {
      leaderboard = this.generateMockLeaderboard();
      localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(leaderboard));
    }

    return leaderboard.sort((a, b) => b.score - a.score);
  },

  async submitScore(score: number, mode: 'pass-through' | 'walls'): Promise<void> {
    await delay();
    
    const user = await this.getCurrentUser();
    if (!user) return;

    const stored = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
    const leaderboard: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];

    leaderboard.push({
      id: Math.random().toString(36).substr(2, 9),
      username: user.username,
      score,
      mode,
      timestamp: Date.now(),
    });

    localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(leaderboard));
  },

  /**
   * Active Players (for watching mode)
   */
  async getActivePlayers(): Promise<ActivePlayer[]> {
    await delay();
    
    // Generate mock active players
    const mockPlayers: ActivePlayer[] = [
      { id: '1', username: 'CosmicGamer', currentScore: 45, mode: 'pass-through' },
      { id: '2', username: 'StarSnake', currentScore: 32, mode: 'walls' },
      { id: '3', username: 'NebulaKing', currentScore: 28, mode: 'pass-through' },
      { id: '4', username: 'AstroPlayer', currentScore: 51, mode: 'walls' },
      { id: '5', username: 'GalaxyMaster', currentScore: 19, mode: 'pass-through' },
    ];

    return mockPlayers;
  },

  /**
   * Watching Mode - Get gameplay frames for a player
   */
  async* watchPlayer(playerId: string): AsyncGenerator<GameFrame> {
    // Simulate real-time game frames
    let score = Math.floor(Math.random() * 30) + 10;
    const gridSize = 20;
    
    let snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    
    let food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
    
    const directions: Array<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'> = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    let direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' = directions[Math.floor(Math.random() * directions.length)];
    
    // Generate frames indefinitely
    while (true) {
      await delay(200); // Frame every 200ms
      
      // Occasionally change direction
      if (Math.random() > 0.7) {
        direction = directions[Math.floor(Math.random() * directions.length)];
      }
      
      // Move snake
      const head = { ...snake[0] };
      
      switch (direction) {
        case 'UP':
          head.y = (head.y - 1 + gridSize) % gridSize;
          break;
        case 'DOWN':
          head.y = (head.y + 1) % gridSize;
          break;
        case 'LEFT':
          head.x = (head.x - 1 + gridSize) % gridSize;
          break;
        case 'RIGHT':
          head.x = (head.x + 1) % gridSize;
          break;
      }
      
      snake.unshift(head);
      
      // Check if ate food
      if (head.x === food.x && head.y === food.y) {
        score++;
        food = {
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize),
        };
      } else {
        snake.pop();
      }
      
      yield {
        snake,
        food,
        score,
        direction,
      };
    }
  },

  /**
   * Helper to generate mock leaderboard data
   */
  generateMockLeaderboard(): LeaderboardEntry[] {
    const mockUsernames = [
      'CosmicGamer', 'StarSnake', 'NebulaKing', 'AstroPlayer', 'GalaxyMaster',
      'SpaceAce', 'VoidRunner', 'NovaNinja', 'OrbitHero', 'LunarLegend',
      'MeteorMaster', 'StellarSnake', 'CometChaser', 'PlanetPro', 'SaturnSlayer',
    ];

    const modes: Array<'pass-through' | 'walls'> = ['pass-through', 'walls'];

    return mockUsernames.map((username, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      username,
      score: Math.floor(Math.random() * 100) + (mockUsernames.length - index) * 5,
      mode: modes[Math.floor(Math.random() * modes.length)],
      timestamp: Date.now() - Math.floor(Math.random() * 86400000 * 7), // Random time in last 7 days
    }));
  },
};
