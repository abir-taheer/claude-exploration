import type { WorldConfig, WorldStats, SerializedCreature } from '../types';

interface Props {
  config: WorldConfig | null;
  stats: WorldStats | null;
  creatures: SerializedCreature[];
  paused: boolean;
  connected: boolean;
  speed: number;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onUpdateConfig: (updates: Partial<WorldConfig>) => void;
  onChangeSpeed: (speed: number) => void;
}

function calculateEcosystemHealth(creatures: SerializedCreature[]): { score: number; status: string; color: string } {
  if (creatures.length === 0) return { score: 0, status: 'Extinct', color: '#ff4444' };

  const herbivores = creatures.filter(c => c.dietType === 'herbivore').length;
  const carnivores = creatures.filter(c => c.dietType === 'carnivore').length;
  const omnivores = creatures.filter(c => c.dietType === 'omnivore').length;
  const total = creatures.length;

  // Ideal ratios: ~50% herbivore, ~30% omnivore, ~20% carnivore
  const herbRatio = herbivores / total;
  const carnRatio = carnivores / total;
  const omniRatio = omnivores / total;

  // Score diversity (penalize missing types)
  let diversityScore = 100;
  if (herbivores === 0) diversityScore -= 40;
  if (carnivores === 0) diversityScore -= 30;
  if (omnivores === 0) diversityScore -= 20;

  // Score balance (penalize if one type dominates too much)
  if (herbRatio > 0.8 || carnRatio > 0.6 || omniRatio > 0.7) {
    diversityScore -= 30;
  }

  // Population health
  let popScore = 100;
  if (total < 10) popScore -= 40;
  else if (total < 20) popScore -= 20;
  else if (total > 100) popScore -= 10;

  const score = Math.max(0, Math.min(100, (diversityScore + popScore) / 2));

  let status = 'Thriving';
  let color = '#44ff44';
  if (score < 30) { status = 'Critical'; color = '#ff4444'; }
  else if (score < 50) { status = 'Struggling'; color = '#ff8844'; }
  else if (score < 70) { status = 'Stable'; color = '#ffff44'; }

  return { score, status, color };
}

export function ControlPanel({
  config,
  stats,
  creatures,
  paused,
  connected,
  speed,
  onPause,
  onResume,
  onReset,
  onUpdateConfig,
  onChangeSpeed,
}: Props) {
  if (!config) return null;

  const health = calculateEcosystemHealth(creatures);

  return (
    <div style={{
      backgroundColor: '#1a1a2a',
      padding: '16px',
      borderRadius: '8px',
      color: 'white',
      width: '280px',
      fontFamily: 'monospace',
    }}>
      <h2 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
        EvoSim Control
      </h2>

      {/* Connection Status */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{
          display: 'inline-block',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: connected ? '#44ff44' : '#ff4444',
          marginRight: '8px',
        }} />
        {connected ? 'Connected' : 'Disconnected'}
      </div>

      {/* Playback Controls */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        {paused ? (
          <button onClick={onResume} style={buttonStyle}>
            Resume
          </button>
        ) : (
          <button onClick={onPause} style={buttonStyle}>
            Pause
          </button>
        )}
        <button onClick={onReset} style={buttonStyle}>
          Reset
        </button>
      </div>

      {/* Speed Controls */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Speed: {speed}x</h3>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1, 2, 4, 8].map(s => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              style={{
                ...speedButtonStyle,
                backgroundColor: speed === s ? '#3366ff' : '#333',
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Ecosystem Health */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Ecosystem Health</h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
        }}>
          <div style={{
            flex: 1,
            height: '8px',
            backgroundColor: '#333',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${health.score}%`,
              height: '100%',
              backgroundColor: health.color,
              transition: 'width 0.3s, background-color 0.3s',
            }} />
          </div>
          <span style={{ color: health.color, fontSize: '12px', minWidth: '70px' }}>
            {health.status}
          </span>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Statistics</h3>

          {/* Diet type breakdown */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '8px',
            fontSize: '10px',
          }}>
            <span style={{
              backgroundColor: '#44cc44',
              color: 'black',
              padding: '2px 6px',
              borderRadius: '4px',
            }}>
              H: {creatures.filter(c => c.dietType === 'herbivore').length}
            </span>
            <span style={{
              backgroundColor: '#cc4444',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
            }}>
              C: {creatures.filter(c => c.dietType === 'carnivore').length}
            </span>
            <span style={{
              backgroundColor: '#aa44aa',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
            }}>
              O: {creatures.filter(c => c.dietType === 'omnivore').length}
            </span>
          </div>

          <div style={statRowStyle}>
            <span>Population:</span>
            <span>{stats.currentPopulation}</span>
          </div>
          <div style={statRowStyle}>
            <span>Generation:</span>
            <span style={{ color: '#ff8844' }}>{stats.maxGeneration}</span>
          </div>
          <div style={statRowStyle}>
            <span>Births / Deaths:</span>
            <span>
              <span style={{ color: '#44ff44' }}>{stats.totalBirths}</span>
              {' / '}
              <span style={{ color: '#ff4444' }}>{stats.totalDeaths}</span>
            </span>
          </div>
          <div style={statRowStyle}>
            <span>Avg Energy:</span>
            <span style={{
              color: stats.averageEnergy > 50 ? '#44ff44' : stats.averageEnergy > 30 ? '#ffff44' : '#ff4444'
            }}>{stats.averageEnergy.toFixed(1)}</span>
          </div>
          <div style={statRowStyle}>
            <span>Oldest:</span>
            <span>{(stats.oldestCreature / 60).toFixed(1)}s</span>
          </div>
        </div>
      )}

      {/* Configuration */}
      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Configuration</h3>

        <label style={sliderLabelStyle}>
          Mutation Rate: {(config.mutationRate * 100).toFixed(0)}%
          <input
            type="range"
            min="0"
            max="50"
            value={config.mutationRate * 100}
            onChange={(e) => onUpdateConfig({ mutationRate: Number(e.target.value) / 100 })}
            style={sliderStyle}
          />
        </label>

        <label style={sliderLabelStyle}>
          Mutation Strength: {(config.mutationStrength * 100).toFixed(0)}%
          <input
            type="range"
            min="5"
            max="100"
            value={config.mutationStrength * 100}
            onChange={(e) => onUpdateConfig({ mutationStrength: Number(e.target.value) / 100 })}
            style={sliderStyle}
          />
        </label>

        <label style={sliderLabelStyle}>
          Food Spawn Rate: {config.foodSpawnRate.toFixed(2)}
          <input
            type="range"
            min="10"
            max="200"
            value={config.foodSpawnRate * 100}
            onChange={(e) => onUpdateConfig({ foodSpawnRate: Number(e.target.value) / 100 })}
            style={sliderStyle}
          />
        </label>

        <label style={sliderLabelStyle}>
          Max Food: {config.maxFood}
          <input
            type="range"
            min="50"
            max="500"
            value={config.maxFood}
            onChange={(e) => onUpdateConfig({ maxFood: Number(e.target.value) })}
            style={sliderStyle}
          />
        </label>

        <label style={sliderLabelStyle}>
          Reproduction Threshold: {config.reproductionThreshold}
          <input
            type="range"
            min="50"
            max="100"
            value={config.reproductionThreshold}
            onChange={(e) => onUpdateConfig({ reproductionThreshold: Number(e.target.value) })}
            style={sliderStyle}
          />
        </label>

        <label style={sliderLabelStyle}>
          Lifespan (energy drain): {((config.energyDrainMultiplier || 0.5) * 100).toFixed(0)}%
          <input
            type="range"
            min="10"
            max="150"
            value={(config.energyDrainMultiplier || 0.5) * 100}
            onChange={(e) => onUpdateConfig({ energyDrainMultiplier: Number(e.target.value) / 100 })}
            style={sliderStyle}
          />
          <span style={{ fontSize: '10px', color: '#888' }}>
            Lower = longer lifespan
          </span>
        </label>

        <label style={{ ...sliderLabelStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={config.guaranteedHunting || false}
            onChange={(e) => onUpdateConfig({ guaranteedHunting: e.target.checked })}
            style={{ width: '16px', height: '16px' }}
          />
          Guaranteed Hunting
          <span style={{ fontSize: '10px', color: '#888' }}>
            (100% success rate)
          </span>
        </label>
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#3366ff',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'monospace',
  flex: 1,
};

const speedButtonStyle: React.CSSProperties = {
  backgroundColor: '#333',
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'monospace',
  flex: 1,
};

const statRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '4px',
  fontSize: '12px',
};

const sliderLabelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '12px',
  fontSize: '12px',
};

const sliderStyle: React.CSSProperties = {
  width: '100%',
  marginTop: '4px',
};
