import type { SerializedCreature } from '../types';

interface Props {
  creature: SerializedCreature | null;
  onClose: () => void;
}

export function CreatureInspector({ creature, onClose }: Props) {
  if (!creature) return null;

  return (
    <div style={{
      backgroundColor: '#1a1a2a',
      padding: '16px',
      borderRadius: '8px',
      color: 'white',
      fontFamily: 'monospace',
      position: 'absolute',
      top: '20px',
      right: '320px',
      width: '220px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
      border: '2px solid #ffff00',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        borderBottom: '1px solid #333',
        paddingBottom: '8px',
      }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>Creature Inspector</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ×
        </button>
      </div>

      <div style={{ fontSize: '11px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
          gap: '8px',
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: creature.color,
            borderRadius: '50%',
          }} />
          <span style={{ color: '#888' }}>ID: {creature.id.slice(0, 12)}</span>
        </div>

        <div style={rowStyle}>
          <span>Generation:</span>
          <span style={{ color: '#ff8844' }}>{creature.generation}</span>
        </div>

        <div style={rowStyle}>
          <span>Energy:</span>
          <span style={{
            color: creature.energy > 60 ? '#44ff44' : creature.energy > 30 ? '#ffff44' : '#ff4444'
          }}>
            {creature.energy.toFixed(1)}%
          </span>
        </div>

        <div style={rowStyle}>
          <span>Size:</span>
          <span>{creature.size.toFixed(1)}</span>
        </div>

        <div style={rowStyle}>
          <span>Position:</span>
          <span>({creature.x.toFixed(0)}, {creature.y.toFixed(0)})</span>
        </div>

        <div style={rowStyle}>
          <span>Heading:</span>
          <span>{(creature.angle * 180 / Math.PI).toFixed(0)}°</span>
        </div>

        <div style={{
          marginTop: '12px',
          padding: '8px',
          backgroundColor: '#0a0a0f',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#888',
        }}>
          Click elsewhere or × to deselect
        </div>
      </div>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '4px',
};
