import { useRef, useEffect, useCallback } from 'react';
import type { SerializedState, SerializedCreature } from '../types';

interface Props {
  state: SerializedState | null;
  width: number;
  height: number;
  selectedCreature: SerializedCreature | null;
  onSelectCreature: (creature: SerializedCreature | null) => void;
}

// Trail configuration
const TRAIL_LENGTH = 20;
const TRAIL_OPACITY = 0.3;

export function SimulationCanvas({ state, width, height, selectedCreature, onSelectCreature }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailsRef = useRef<Map<string, Array<{x: number, y: number}>>>(new Map());

  // Handle click to select creature
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!state) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find closest creature within click radius
    let closest: SerializedCreature | null = null;
    let closestDist = 30; // Max click distance

    for (const creature of state.creatures) {
      const dx = creature.x - x;
      const dy = creature.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist) {
        closestDist = dist;
        closest = creature;
      }
    }

    onSelectCreature(closest);
  }, [state, onSelectCreature]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !state) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Update trails for each creature
    const currentCreatureIds = new Set(state.creatures.map(c => c.id));

    // Remove trails for dead creatures
    for (const id of trailsRef.current.keys()) {
      if (!currentCreatureIds.has(id)) {
        trailsRef.current.delete(id);
      }
    }

    // Update trails with current positions
    for (const creature of state.creatures) {
      let trail = trailsRef.current.get(creature.id);
      if (!trail) {
        trail = [];
        trailsRef.current.set(creature.id, trail);
      }
      trail.push({ x: creature.x, y: creature.y });
      if (trail.length > TRAIL_LENGTH) {
        trail.shift();
      }
    }

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

    // Draw creature trails
    for (const creature of state.creatures) {
      const trail = trailsRef.current.get(creature.id);
      if (trail && trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.strokeStyle = creature.color.replace('rgb', 'rgba').replace(')', `, ${TRAIL_OPACITY})`);
        ctx.lineWidth = creature.size * 0.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
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

    // Find oldest creature
    const oldestAge = Math.max(...state.creatures.map(c => c.age));

    // Draw creatures
    for (const creature of state.creatures) {
      const { x, y, angle, size, color, energy, id, age } = creature;
      const isSelected = selectedCreature?.id === id;
      const isNewborn = age < 60; // Young creature (1 second old)
      const isOldest = age === oldestAge && oldestAge > 300; // Only show if somewhat old

      // Energy-based opacity
      const opacity = 0.5 + (energy / 100) * 0.5;

      // Draw body
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Newborn glow effect
      if (isNewborn) {
        const glowIntensity = 1 - (age / 60); // Fade out over time
        const glowRadius = size * 3;
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.4 * glowIntensity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Selection highlight and sense radius
      if (isSelected) {
        // Sense radius circle
        ctx.beginPath();
        ctx.arc(0, 0, creature.senseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Selection ring
        ctx.beginPath();
        ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

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
      // Oldest creature crown indicator
      ctx.rotate(-angle); // Reset rotation

      if (isOldest) {
        ctx.fillStyle = '#ffd700';
        ctx.font = `${Math.max(12, size)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('👑', 0, -size - 12);
      }

      const barWidth = size * 2;
      const barHeight = 3;
      const barY = isOldest ? -size - 24 : -size - 8;

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
  }, [state, width, height, selectedCreature]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      style={{
        border: '2px solid #333',
        borderRadius: '8px',
        display: 'block',
        cursor: 'crosshair',
      }}
    />
  );
}
