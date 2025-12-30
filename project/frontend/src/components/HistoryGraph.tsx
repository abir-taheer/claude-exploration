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

    // Find data ranges
    const maxPop = Math.max(...history.map(h => h.population), 10);
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

    // Draw population line (blue)
    ctx.strokeStyle = '#4488ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = padding.left + (i / (history.length - 1)) * graphWidth;
      const y = height - padding.bottom - (point.population / maxPop) * graphHeight;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw generation line (orange)
    ctx.strokeStyle = '#ff8844';
    ctx.lineWidth = 2;
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

    // Legend
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(width - 100, 8, 12, 12);
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Population', width - 85, 17);

    ctx.fillStyle = '#ff8844';
    ctx.fillRect(width - 100, 24, 12, 12);
    ctx.fillStyle = '#fff';
    ctx.fillText('Generation', width - 85, 33);

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
