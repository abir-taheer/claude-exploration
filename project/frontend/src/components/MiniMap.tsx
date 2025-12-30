import { useRef, useEffect } from 'react';
import type { SerializedState, SerializedCreature } from '../types';

interface Props {
  state: SerializedState | null;
  worldWidth: number;
  worldHeight: number;
  size?: number;
  selectedCreature?: SerializedCreature | null;
}

export function MiniMap({ state, worldWidth, worldHeight, size = 150, selectedCreature }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const aspectRatio = worldWidth / worldHeight;
  const mapWidth = size;
  const mapHeight = size / aspectRatio;
  const scaleX = mapWidth / worldWidth;
  const scaleY = mapHeight / worldHeight;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !state) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with dark background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, mapWidth, mapHeight);

    // Draw border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, mapWidth, mapHeight);

    // Draw food as small green dots
    ctx.fillStyle = '#44ff44';
    for (const food of state.food) {
      const x = food.x * scaleX;
      const y = food.y * scaleY;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw creatures as colored dots
    for (const creature of state.creatures) {
      const x = creature.x * scaleX;
      const y = creature.y * scaleY;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = creature.color;
      ctx.fill();
    }

    // Highlight selected creature
    if (selectedCreature) {
      const x = selectedCreature.x * scaleX;
      const y = selectedCreature.y * scaleY;

      // Pulsing ring effect
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffff00';
      ctx.fill();
    }
  }, [state, mapWidth, mapHeight, scaleX, scaleY, selectedCreature]);

  if (!state) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '4px',
      padding: '4px',
    }}>
      <canvas
        ref={canvasRef}
        width={mapWidth}
        height={mapHeight}
        style={{
          display: 'block',
          borderRadius: '2px',
        }}
      />
      <div style={{
        color: '#666',
        fontSize: '9px',
        textAlign: 'center',
        marginTop: '2px',
        fontFamily: 'monospace',
      }}>
        MINI-MAP
      </div>
    </div>
  );
}
