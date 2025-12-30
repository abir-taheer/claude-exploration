import type { WorldConfig, WorldStats } from '../types';

interface Props {
  config: WorldConfig | null;
  stats: WorldStats | null;
  paused: boolean;
  connected: boolean;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onUpdateConfig: (updates: Partial<WorldConfig>) => void;
}

export function ControlPanel({
  config,
  stats,
  paused,
  connected,
  onPause,
  onResume,
  onReset,
  onUpdateConfig,
}: Props) {
  if (!config) return null;

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

      {/* Stats */}
      {stats && (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Statistics</h3>
          <div style={statRowStyle}>
            <span>Population:</span>
            <span>{stats.currentPopulation}</span>
          </div>
          <div style={statRowStyle}>
            <span>Generation:</span>
            <span>{stats.maxGeneration}</span>
          </div>
          <div style={statRowStyle}>
            <span>Total Births:</span>
            <span>{stats.totalBirths}</span>
          </div>
          <div style={statRowStyle}>
            <span>Total Deaths:</span>
            <span>{stats.totalDeaths}</span>
          </div>
          <div style={statRowStyle}>
            <span>Avg Energy:</span>
            <span>{stats.averageEnergy.toFixed(1)}</span>
          </div>
          <div style={statRowStyle}>
            <span>Avg Speed:</span>
            <span>{stats.averageSpeed.toFixed(2)}</span>
          </div>
          <div style={statRowStyle}>
            <span>Avg Size:</span>
            <span>{stats.averageSize.toFixed(1)}</span>
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
