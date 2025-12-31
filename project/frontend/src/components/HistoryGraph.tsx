import { useRef, useEffect } from 'react';
import type { HistoryPoint } from '../types';

interface Props {
  history: HistoryPoint[];
  width: number;
  height: number;
}

export function HistoryGraph({ history, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(0, 0, width, height);

    // Calculate bounds
    const padding = { top: 20, right: 10, bottom: 25, left: 40 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Find data ranges - use max of individual diet counts for better scaling
    const maxHerb = Math.max(...history.map(h => h.herbivores ?? 0), 1);
    const maxCarn = Math.max(...history.map(h => h.carnivores ?? 0), 1);
    const maxPop = Math.max(maxHerb, maxCarn, 10);
    const maxGen = Math.max(...history.map(h => h.maxGeneration), 1);

    // Draw axes
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = '#888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(String(maxPop), padding.left - 5, padding.top + 5);
    ctx.fillText('0', padding.left - 5, height - padding.bottom + 3);

    // X-axis label
    ctx.textAlign = 'center';
    ctx.fillText('Time', width / 2, height - 5);

    // Draw herbivore line (green)
    ctx.strokeStyle = '#44cc44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = padding.left + (i / (history.length - 1)) * graphWidth;
      const herbCount = point.herbivores ?? 0;
      const y = height - padding.bottom - (herbCount / maxPop) * graphHeight;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw carnivore line (red)
    ctx.strokeStyle = '#cc4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = padding.left + (i / (history.length - 1)) * graphWidth;
      const carnCount = point.carnivores ?? 0;
      const y = height - padding.bottom - (carnCount / maxPop) * graphHeight;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw generation line (orange dashed)
    ctx.strokeStyle = '#ff8844';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = padding.left + (i / (history.length - 1)) * graphWidth;
      const y = height - padding.bottom - (point.maxGeneration / maxGen) * graphHeight;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Legend
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#44cc44';
    ctx.fillRect(width - 80, 6, 10, 10);
    ctx.fillStyle = '#fff';
    ctx.fillText('Herb', width - 67, 15);

    ctx.fillStyle = '#cc4444';
    ctx.fillRect(width - 80, 20, 10, 10);
    ctx.fillStyle = '#fff';
    ctx.fillText('Carn', width - 67, 29);

    ctx.fillStyle = '#ff8844';
    ctx.fillRect(width - 80, 34, 10, 10);
    ctx.fillStyle = '#fff';
    ctx.fillText('Gen', width - 67, 43);

  }, [history, width, height]);

  if (history.length < 2) {
    return (
      <div style={{
        width,
        height,
        backgroundColor: '#1a1a2a',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontFamily: 'monospace',
        fontSize: '12px',
      }}>
        Gathering history data...
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        borderRadius: '8px',
        display: 'block',
      }}
    />
  );
}
