import { useRef, useEffect } from 'react';
import type { SerializedState } from '../types';

interface Props {
  state: SerializedState | null;
  width: number;
  height: number;
}

export function SimulationCanvas({ state, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !state) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Draw grid (subtle)
    ctx.strokeStyle = '#1a1a2a';
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw food
    for (const food of state.food) {
      ctx.beginPath();
      ctx.arc(food.x, food.y, food.size, 0, Math.PI * 2);
      ctx.fillStyle = '#44ff44';
      ctx.fill();

      // Glow effect
      const gradient = ctx.createRadialGradient(
        food.x, food.y, 0,
        food.x, food.y, food.size * 2
      );
      gradient.addColorStop(0, 'rgba(68, 255, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(68, 255, 68, 0)');
      ctx.beginPath();
      ctx.arc(food.x, food.y, food.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw creatures
    for (const creature of state.creatures) {
      const { x, y, angle, size, color, energy } = creature;

      // Energy-based opacity
      const opacity = 0.5 + (energy / 100) * 0.5;

      // Draw body
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Body (elongated oval pointing in direction)
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 1.3, size * 0.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
      ctx.fill();

      // Direction indicator (front point)
      ctx.beginPath();
      ctx.moveTo(size * 1.5, 0);
      ctx.lineTo(size * 0.8, -size * 0.5);
      ctx.lineTo(size * 0.8, size * 0.5);
      ctx.closePath();
      ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', `, ${opacity * 0.8})`);
      ctx.fill();

      // Energy bar
      ctx.rotate(-angle); // Reset rotation for energy bar
      const barWidth = size * 2;
      const barHeight = 3;
      const barY = -size - 8;

      // Background
      ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
      ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

      // Energy fill
      const energyWidth = (energy / 100) * barWidth;
      const energyColor = energy > 60 ? '#44ff44' : energy > 30 ? '#ffff44' : '#ff4444';
      ctx.fillStyle = energyColor;
      ctx.fillRect(-barWidth / 2, barY, energyWidth, barHeight);

      ctx.restore();
    }

    // Draw stats overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '14px monospace';
    ctx.fillText(`Tick: ${state.tick}`, 10, 20);
    ctx.fillText(`Population: ${state.creatures.length}`, 10, 40);
    ctx.fillText(`Food: ${state.food.length}`, 10, 60);
    ctx.fillText(`Max Gen: ${state.stats.maxGeneration}`, 10, 80);
  }, [state, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        border: '2px solid #333',
        borderRadius: '8px',
        display: 'block',
      }}
    />
  );
}
