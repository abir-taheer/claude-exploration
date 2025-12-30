import { useSimulation } from './hooks/useSimulation';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ControlPanel } from './components/ControlPanel';
import { HistoryGraph } from './components/HistoryGraph';

function App() {
  const {
    state,
    config,
    connected,
    paused,
    history,
    speed,
    pause,
    resume,
    reset,
    updateConfig,
    changeSpeed,
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
        fontSize: '24px',
      }}>
        EvoSim - Evolutionary Simulation
      </h1>

      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SimulationCanvas
            state={state}
            width={worldWidth}
            height={worldHeight}
          />
          <HistoryGraph
            history={history}
            width={worldWidth}
            height={120}
          />
        </div>

        <ControlPanel
          config={config}
          stats={state?.stats || null}
          paused={paused}
          connected={connected}
          speed={speed}
          onPause={pause}
          onResume={resume}
          onReset={reset}
          onUpdateConfig={updateConfig}
          onChangeSpeed={changeSpeed}
        />
      </div>

      <footer style={{
        marginTop: '20px',
        color: '#666',
        fontFamily: 'monospace',
        fontSize: '12px',
        textAlign: 'center',
      }}>
        Watch artificial creatures evolve in real-time. Blue line = Population, Orange line = Generation.
      </footer>
    </div>
  );
}

export default App;
