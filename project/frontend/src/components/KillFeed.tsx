import type { SerializedKill } from '../types';

interface Props {
  kills: SerializedKill[];
}

const dietEmoji: Record<string, string> = {
  herbivore: '🌱',
  carnivore: '🔴',
  omnivore: '🟣',
};

const dietColor: Record<string, string> = {
  herbivore: '#44cc44',
  carnivore: '#cc4444',
  omnivore: '#aa44aa',
};

export function KillFeed({ kills }: Props) {
  if (kills.length === 0) return null;

  return (
    <div style={{
      backgroundColor: 'rgba(20, 20, 30, 0.9)',
      padding: '8px 12px',
      borderRadius: '8px',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '11px',
      position: 'absolute',
      top: '10px',
      left: '10px',
      maxWidth: '200px',
      zIndex: 10,
    }}>
      <div style={{
        fontSize: '10px',
        color: '#888',
        marginBottom: '6px',
        borderBottom: '1px solid #333',
        paddingBottom: '4px',
      }}>
        Recent Kills
      </div>
      {kills.slice(0, 5).map((kill, i) => (
        <div
          key={i}
          style={{
            marginBottom: '4px',
            opacity: 1 - (i * 0.15),
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span style={{ color: dietColor[kill.hunterType] }}>
            {dietEmoji[kill.hunterType]}
          </span>
          <span style={{ color: '#666' }}>G{kill.hunterGen}</span>
          <span style={{ color: '#ff6666' }}>killed</span>
          <span style={{ color: dietColor[kill.preyType] }}>
            {dietEmoji[kill.preyType]}
          </span>
          <span style={{ color: '#666' }}>G{kill.preyGen}</span>
        </div>
      ))}
    </div>
  );
}
