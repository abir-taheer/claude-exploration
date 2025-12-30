import { useSimulation } from './hooks/useSimulation';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ControlPanel } from './components/ControlPanel';

function App() {
  const {
    state,
    config,
    connected,
    paused,
    pause,
    resume,
    reset,
    updateConfig,
  } = useSimulation();

  const worldWidth = state?.config.width || 800;
  const worldHeight = state?.config.height || 600;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
    }}>
      <h1 style={{
        color: 'white',
        fontFamily: 'monospace',
        marginBottom: '20px',
      }}>
        EvoSim - Evolutionary Simulation
      </h1>

      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
      }}>
        <SimulationCanvas
          state={state}
          width={worldWidth}
          height={worldHeight}
        />

        <ControlPanel
          config={config}
          stats={state?.stats || null}
          paused={paused}
          connected={connected}
          onPause={pause}
          onResume={resume}
          onReset={reset}
          onUpdateConfig={updateConfig}
        />
      </div>

      <footer style={{
        marginTop: '20px',
        color: '#666',
        fontFamily: 'monospace',
        fontSize: '12px',
      }}>
        Watch artificial creatures evolve in real-time. Adjust parameters to influence selection pressures.
      </footer>
    </div>
  );
}

export default App;
