import { useEffect, useRef } from 'react';
import { Position } from '@/hooks/useSnakeGame';

interface GameCanvasProps {
  snake: Position[];
  food: Position;
  gridSize: number;
  gameOver: boolean;
}

export const GameCanvas = ({ snake, food, gridSize, gameOver }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / gridSize;

    // Clear canvas
    ctx.fillStyle = 'hsl(240 20% 6%)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'hsl(240 20% 15%)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw food with glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'hsl(330 85% 60%)';
    ctx.fillStyle = 'hsl(330 85% 60%)';
    ctx.beginPath();
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw snake with gradient
    snake.forEach((segment, index) => {
      const gradient = ctx.createLinearGradient(
        segment.x * cellSize,
        segment.y * cellSize,
        (segment.x + 1) * cellSize,
        (segment.y + 1) * cellSize
      );

      if (index === 0) {
        // Head - brighter gradient
        gradient.addColorStop(0, 'hsl(280 85% 75%)');
        gradient.addColorStop(1, 'hsl(195 100% 60%)');
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'hsl(280 85% 65%)';
      } else {
        // Body - darker gradient
        const opacity = 1 - (index / snake.length) * 0.3;
        gradient.addColorStop(0, `hsl(280 85% 65% / ${opacity})`);
        gradient.addColorStop(1, `hsl(195 100% 50% / ${opacity})`);
        ctx.shadowBlur = 5;
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(
        segment.x * cellSize + 2,
        segment.y * cellSize + 2,
        cellSize - 4,
        cellSize - 4
      );
    });
    ctx.shadowBlur = 0;

    // Draw game over overlay
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'hsl(0 85% 60%)';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    }
  }, [snake, food, gridSize, gameOver]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      className="border border-border rounded-lg shadow-card"
    />
  );
};
