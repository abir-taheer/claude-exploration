import type { SerializedCreature } from '../types';

interface Props {
  creatures: SerializedCreature[];
  selectedId: string | null;
  onSelect: (creature: SerializedCreature) => void;
}

export function Leaderboard({ creatures, selectedId, onSelect }: Props) {
  // Get top 5 creatures by food eaten
  const top = [...creatures]
    .sort((a, b) => b.foodEaten - a.foodEaten)
    .slice(0, 5);

  if (top.length === 0) return null;

  return (
    <div style={{
      backgroundColor: '#1a1a2a',
      padding: '12px',
      borderRadius: '8px',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '11px',
      marginTop: '10px',
    }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#888' }}>
        Top Hunters
      </h3>

      {top.map((creature, i) => (
        <div
          key={creature.id}
          onClick={() => onSelect(creature)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 6px',
            marginBottom: '4px',
            borderRadius: '4px',
            backgroundColor: selectedId === creature.id ? '#333' : 'transparent',
            cursor: 'pointer',
            border: selectedId === creature.id ? '1px solid #ffff00' : '1px solid transparent',
          }}
        >
          <span style={{
            color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#666',
            width: '14px',
          }}>
            #{i + 1}
          </span>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: creature.color,
            borderRadius: '50%',
            flexShrink: 0,
          }} />
          <span style={{ flex: 1, color: '#aaa' }}>
            Gen {creature.generation}
          </span>
          <span style={{ color: '#44ff44' }}>
            {creature.foodEaten}
          </span>
        </div>
      ))}

      <div style={{
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid #333',
        color: '#666',
        fontSize: '10px',
      }}>
        Click to track creature
      </div>
    </div>
  );
}
