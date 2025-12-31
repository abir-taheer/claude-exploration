import type { SerializedCreature } from '../types';

interface Props {
  creatures: SerializedCreature[];
}

export function GenomeStats({ creatures }: Props) {
  if (creatures.length === 0) return null;

  // Calculate averages by diet type
  const byDiet = {
    herbivore: creatures.filter(c => c.dietType === 'herbivore'),
    carnivore: creatures.filter(c => c.dietType === 'carnivore'),
    omnivore: creatures.filter(c => c.dietType === 'omnivore'),
  };

  const calcAvg = (arr: SerializedCreature[], key: 'size' | 'maxSpeed' | 'senseRadius') => {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, c) => sum + c[key], 0) / arr.length;
  };

  const stats = {
    herbivore: {
      count: byDiet.herbivore.length,
      size: calcAvg(byDiet.herbivore, 'size'),
      speed: calcAvg(byDiet.herbivore, 'maxSpeed'),
      sense: calcAvg(byDiet.herbivore, 'senseRadius'),
    },
    carnivore: {
      count: byDiet.carnivore.length,
      size: calcAvg(byDiet.carnivore, 'size'),
      speed: calcAvg(byDiet.carnivore, 'maxSpeed'),
      sense: calcAvg(byDiet.carnivore, 'senseRadius'),
    },
    omnivore: {
      count: byDiet.omnivore.length,
      size: calcAvg(byDiet.omnivore, 'size'),
      speed: calcAvg(byDiet.omnivore, 'maxSpeed'),
      sense: calcAvg(byDiet.omnivore, 'senseRadius'),
    },
  };

  return (
    <div style={{
      backgroundColor: '#1a1a2a',
      padding: '12px',
      borderRadius: '8px',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '10px',
      marginTop: '10px',
    }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#888' }}>
        Trait Averages by Diet
      </h3>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333' }}>
            <th style={{ textAlign: 'left', padding: '4px 0' }}>Type</th>
            <th style={{ textAlign: 'right', padding: '4px 4px' }}>Size</th>
            <th style={{ textAlign: 'right', padding: '4px 4px' }}>Speed</th>
            <th style={{ textAlign: 'right', padding: '4px 0' }}>Sense</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ color: '#44cc44' }}>
            <td style={{ padding: '4px 0' }}>🌱 ({stats.herbivore.count})</td>
            <td style={{ textAlign: 'right', padding: '4px 4px' }}>{stats.herbivore.size.toFixed(1)}</td>
            <td style={{ textAlign: 'right', padding: '4px 4px' }}>{stats.herbivore.speed.toFixed(2)}</td>
            <td style={{ textAlign: 'right', padding: '4px 0' }}>{stats.herbivore.sense.toFixed(0)}</td>
          </tr>
          <tr style={{ color: '#cc4444' }}>
            <td style={{ padding: '4px 0' }}>🔴 ({stats.carnivore.count})</td>
            <td style={{ textAlign: 'right', padding: '4px 4px' }}>{stats.carnivore.size.toFixed(1)}</td>
            <td style={{ textAlign: 'right', padding: '4px 4px' }}>{stats.carnivore.speed.toFixed(2)}</td>
            <td style={{ textAlign: 'right', padding: '4px 0' }}>{stats.carnivore.sense.toFixed(0)}</td>
          </tr>
          <tr style={{ color: '#aa44aa' }}>
            <td style={{ padding: '4px 0' }}>🟣 ({stats.omnivore.count})</td>
            <td style={{ textAlign: 'right', padding: '4px 4px' }}>{stats.omnivore.size.toFixed(1)}</td>
            <td style={{ textAlign: 'right', padding: '4px 4px' }}>{stats.omnivore.speed.toFixed(2)}</td>
            <td style={{ textAlign: 'right', padding: '4px 0' }}>{stats.omnivore.sense.toFixed(0)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '8px', color: '#666', fontSize: '9px' }}>
        Watch traits diverge as species specialize
      </div>
    </div>
  );
}
