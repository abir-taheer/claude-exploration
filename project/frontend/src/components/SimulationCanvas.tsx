import { useRef, useEffect, useCallback } from 'react';
import type { SerializedState, SerializedCreature } from '../types';

interface Props {
  state: SerializedState | null;
  width: number;
  height: number;
  selectedCreature: SerializedCreature | null;
  onSelectCreature: (creature: SerializedCreature | null) => void;
  colorByGeneration?: boolean;
}

// Convert generation to color (blue = young generations, red = old generations)
function generationToColor(generation: number, maxGeneration: number): string {
  const ratio = Math.min(generation / Math.max(maxGeneration, 1), 1);
  // HSL interpolation from blue (240) to red (0)
  const hue = 240 - ratio * 240;
  return `hsl(${hue}, 80%, 50%)`;
}

// Trail configuration
const TRAIL_LENGTH = 20;
const TRAIL_OPACITY = 0.3;

// Particle configuration
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

export function SimulationCanvas({ state, width, height, selectedCreature, onSelectCreature, colorByGeneration = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailsRef = useRef<Map<string, Array<{x: number, y: number}>>>(new Map());
  const prevCreatureIdsRef = useRef<Set<string>>(new Set());
  const creatureColorsRef = useRef<Map<string, string>>(new Map()); // Track creature colors for death particles
  const prevFoodRef = useRef<Map<string, {x: number, y: number}>>(new Map());
  const particlesRef = useRef<Particle[]>([]);

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

    // Detect deaths and spawn particles with creature's color
    for (const id of prevCreatureIdsRef.current) {
      if (!currentCreatureIds.has(id)) {
        // This creature died - get its last known position from trail
        const trail = trailsRef.current.get(id);
        const creatureColor = creatureColorsRef.current.get(id) || '#ff4444';
        if (trail && trail.length > 0) {
          const lastPos = trail[trail.length - 1];
          // Spawn death particles with creature's color
          const particleCount = 10;
          for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = 1 + Math.random() * 2.5;
            particlesRef.current.push({
              x: lastPos.x,
              y: lastPos.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: creatureColor,
              life: 35,
              maxLife: 35,
              size: 3 + Math.random() * 3,
            });
          }
        }
        // Clean up color tracking
        creatureColorsRef.current.delete(id);
      }
    }
    // Update creature colors for next frame
    for (const creature of state.creatures) {
      creatureColorsRef.current.set(creature.id, creature.color);
    }
    prevCreatureIdsRef.current = currentCreatureIds;

    // Detect food eaten and spawn green particles
    const currentFoodIds = new Set(state.food.map(f => f.id));
    for (const [id, pos] of prevFoodRef.current) {
      if (!currentFoodIds.has(id)) {
        // Food was eaten - spawn particles
        const particleCount = 6;
        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
          const speed = 0.5 + Math.random() * 1.5;
          particlesRef.current.push({
            x: pos.x,
            y: pos.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1, // Float upward
            color: '#44ff44',
            life: 20,
            maxLife: 20,
            size: 2 + Math.random() * 2,
          });
        }
      }
    }
    // Update food tracking
    prevFoodRef.current.clear();
    for (const food of state.food) {
      prevFoodRef.current.set(food.id, { x: food.x, y: food.y });
    }

    // Update and filter particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      // Different gravity based on particle color (green floats, red falls)
      if (p.color === '#44ff44') {
        p.vy += 0.02; // Light upward drift
      } else {
        p.vy += 0.1; // Gravity for death particles
      }
      p.life--;
      return p.life > 0;
    });

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

    // Draw food hotspots (subtle green gradient zones)
    for (const hotspot of state.hotspots || []) {
      const gradient = ctx.createRadialGradient(
        hotspot.x, hotspot.y, 0,
        hotspot.x, hotspot.y, hotspot.radius
      );
      gradient.addColorStop(0, 'rgba(68, 255, 68, 0.08)');
      gradient.addColorStop(0.7, 'rgba(68, 255, 68, 0.03)');
      gradient.addColorStop(1, 'rgba(68, 255, 68, 0)');
      ctx.beginPath();
      ctx.arc(hotspot.x, hotspot.y, hotspot.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw creature trails
    const maxGen = state.stats.maxGeneration;
    for (const creature of state.creatures) {
      const trail = trailsRef.current.get(creature.id);
      if (trail && trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        const trailColor = colorByGeneration
          ? generationToColor(creature.generation, maxGen).replace('hsl', 'hsla').replace(')', `, ${TRAIL_OPACITY})`)
          : creature.color.replace('rgb', 'rgba').replace(')', `, ${TRAIL_OPACITY})`);
        ctx.strokeStyle = trailColor;
        ctx.lineWidth = creature.size * 0.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
    }

    // Draw particles (death: red, food eaten: green)
    for (const particle of particlesRef.current) {
      const alpha = particle.life / particle.maxLife;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      // Parse hex color to rgba
      const r = parseInt(particle.color.slice(1, 3), 16);
      const g = parseInt(particle.color.slice(3, 5), 16);
      const b = parseInt(particle.color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();
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
    const maxGeneration = state.stats.maxGeneration;
    for (const creature of state.creatures) {
      const { x, y, angle, size, color, energy, id, age, generation } = creature;
      const isSelected = selectedCreature?.id === id;
      const isNewborn = age < 60; // Young creature (1 second old)
      const isOldest = age === oldestAge && oldestAge > 300; // Only show if somewhat old

      // Use generation-based color if enabled
      const displayColor = colorByGeneration
        ? generationToColor(generation, maxGeneration)
        : color;

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
      // Handle both rgb() and hsl() color formats
      const bodyColor = displayColor.startsWith('hsl')
        ? displayColor.replace('hsl', 'hsla').replace(')', `, ${opacity})`)
        : displayColor.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
      ctx.fillStyle = bodyColor;
      ctx.fill();

      // Direction indicator (front point)
      ctx.beginPath();
      ctx.moveTo(size * 1.5, 0);
      ctx.lineTo(size * 0.8, -size * 0.5);
      ctx.lineTo(size * 0.8, size * 0.5);
      ctx.closePath();
      const pointColor = displayColor.startsWith('hsl')
        ? displayColor.replace('hsl', 'hsla').replace(')', `, ${opacity * 0.8})`)
        : displayColor.replace('rgb', 'rgba').replace(')', `, ${opacity * 0.8})`);
      ctx.fillStyle = pointColor;
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

    // Calculate population breakdown by diet type
    const herbivores = state.creatures.filter(c => c.dietType === 'herbivore').length;
    const carnivores = state.creatures.filter(c => c.dietType === 'carnivore').length;
    const omnivores = state.creatures.filter(c => c.dietType === 'omnivore').length;

    // Draw stats overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '14px monospace';
    ctx.fillText(`Tick: ${state.tick}`, 10, 20);
    ctx.fillText(`Population: ${state.creatures.length}`, 10, 40);

    // Diet breakdown with colors
    ctx.fillStyle = '#50cc50';
    ctx.fillText(`  🌱 ${herbivores}`, 120, 40);
    ctx.fillStyle = '#cc5050';
    ctx.fillText(`🔴 ${carnivores}`, 170, 40);
    ctx.fillStyle = '#aa50aa';
    ctx.fillText(`🟣 ${omnivores}`, 220, 40);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`Food: ${state.food.length}`, 10, 60);
    ctx.fillText(`Max Gen: ${state.stats.maxGeneration}`, 10, 80);

    // Color mode indicator
    if (colorByGeneration) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(width - 150, 10, 140, 30);
      ctx.fillStyle = '#fff';
      ctx.font = '11px monospace';
      ctx.fillText('Color: Generation', width - 145, 30);
      // Mini legend
      const legendWidth = 60;
      const legendX = width - 75;
      for (let i = 0; i < legendWidth; i++) {
        ctx.fillStyle = generationToColor(i, legendWidth);
        ctx.fillRect(legendX + i, 32, 1, 4);
      }
    }
  }, [state, width, height, selectedCreature, colorByGeneration]);

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
