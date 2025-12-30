import { useState, useEffect } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ControlPanel } from './components/ControlPanel';
import { HistoryGraph } from './components/HistoryGraph';
import { CreatureInspector } from './components/CreatureInspector';
import { Leaderboard } from './components/Leaderboard';
import type { SerializedCreature } from './types';

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

  const [selectedCreature, setSelectedCreature] = useState<SerializedCreature | null>(null);

  // Update selected creature with current state (track it as it moves)
  useEffect(() => {
    if (selectedCreature && state) {
      const updated = state.creatures.find(c => c.id === selectedCreature.id);
      if (updated) {
        setSelectedCreature(updated);
      } else {
        // Creature died
        setSelectedCreature(null);
      }
    }
  }, [state, selectedCreature?.id]);

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
        position: 'relative',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SimulationCanvas
            state={state}
            width={worldWidth}
            height={worldHeight}
            selectedCreature={selectedCreature}
            onSelectCreature={setSelectedCreature}
          />
          <HistoryGraph
            history={history}
            width={worldWidth}
            height={120}
          />
          <Leaderboard
            creatures={state?.creatures || []}
            selectedId={selectedCreature?.id || null}
            onSelect={setSelectedCreature}
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

        <CreatureInspector
          creature={selectedCreature}
          onClose={() => setSelectedCreature(null)}
        />
      </div>

      <footer style={{
        marginTop: '20px',
        color: '#666',
        fontFamily: 'monospace',
        fontSize: '12px',
        textAlign: 'center',
        maxWidth: '800px',
      }}>
        Watch artificial creatures evolve in real-time. Click creatures to inspect their genome.
        Blue line = Population, Orange line = Generation.
      </footer>
    </div>
  );
}

export default App;
