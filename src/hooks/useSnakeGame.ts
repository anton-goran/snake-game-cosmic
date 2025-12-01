import { useState, useEffect, useCallback, useRef } from 'react';
import { GameMode } from '@/contexts/GameContext';

export interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150; // ms per frame

export const useSnakeGame = (mode: GameMode) => {
  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const directionRef = useRef(direction);
  const requestedDirectionRef = useRef<Direction | null>(null);

  // Generate random food position
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // Check collision with self
  const checkSelfCollision = useCallback((head: Position, body: Position[]): boolean => {
    return body.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  // Check collision with walls (walls mode only)
  const checkWallCollision = useCallback((head: Position): boolean => {
    return head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
  }, []);

  // Handle direction change
  const changeDirection = useCallback((newDirection: Direction) => {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    // Can't reverse direction
    if (opposites[directionRef.current] !== newDirection) {
      requestedDirectionRef.current = newDirection;
    }
  }, []);

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      setSnake(prevSnake => {
        // Apply requested direction at the start of each frame
        if (requestedDirectionRef.current) {
          directionRef.current = requestedDirectionRef.current;
          requestedDirectionRef.current = null;
        }

        const head = { ...prevSnake[0] };

        // Move head based on direction
        switch (directionRef.current) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
        }

        // Handle wrapping or wall collision based on mode
        if (mode === 'pass-through') {
          head.x = (head.x + GRID_SIZE) % GRID_SIZE;
          head.y = (head.y + GRID_SIZE) % GRID_SIZE;
        } else if (checkWallCollision(head)) {
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        // Check self collision
        if (checkSelfCollision(head, prevSnake)) {
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check if ate food
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => prev + 1);
          setFood(generateFood(newSnake));
          // Increase speed slightly
          setSpeed(prev => Math.max(50, prev - 2));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, food, speed, mode, generateFood, checkSelfCollision, checkWallCollision]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, changeDirection]);

  const startGame = useCallback(() => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    requestedDirectionRef.current = null;
    setFood({ x: 15, y: 15 });
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameOver(false);
    setIsPlaying(true);
  }, []);

  const pauseGame = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resumeGame = useCallback(() => {
    if (!gameOver) {
      setIsPlaying(true);
    }
  }, [gameOver]);

  return {
    snake,
    food,
    direction: directionRef.current,
    isPlaying,
    gameOver,
    score,
    gridSize: GRID_SIZE,
    startGame,
    pauseGame,
    resumeGame,
    changeDirection,
  };
};
