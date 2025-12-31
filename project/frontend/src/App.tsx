import { useState, useEffect, useCallback } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ControlPanel } from './components/ControlPanel';
import { HistoryGraph } from './components/HistoryGraph';
import { CreatureInspector } from './components/CreatureInspector';
import { Leaderboard } from './components/Leaderboard';
import { MiniMap } from './components/MiniMap';
import { GenomeStats } from './components/GenomeStats';
import { KillFeed } from './components/KillFeed';
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
  const [colorByGeneration, setColorByGeneration] = useState(false);

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

  // Keyboard shortcuts
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    // Don't trigger if typing in an input
    if (e.target instanceof HTMLInputElement) return;

    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        paused ? resume() : pause();
        break;
      case 'r':
        reset();
        break;
      case '1':
        changeSpeed(1);
        break;
      case '2':
        changeSpeed(2);
        break;
      case '3':
        changeSpeed(4);
        break;
      case '4':
        changeSpeed(8);
        break;
      case 'escape':
        setSelectedCreature(null);
        break;
      case 'c':
        setColorByGeneration(prev => !prev);
        break;
      case 'f':
        // Toggle fullscreen for the simulation container
        const container = document.querySelector('[data-simulation-container]');
        if (container) {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            container.requestFullscreen();
          }
        }
        break;
    }
  }, [paused, pause, resume, reset, changeSpeed]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} data-simulation-container>
          <div style={{ position: 'relative', backgroundColor: '#0a0a0f' }}>
            <SimulationCanvas
              state={state}
              width={worldWidth}
              height={worldHeight}
              selectedCreature={selectedCreature}
              onSelectCreature={setSelectedCreature}
              colorByGeneration={colorByGeneration}
            />
            <MiniMap
              state={state}
              worldWidth={worldWidth}
              worldHeight={worldHeight}
              size={120}
              selectedCreature={selectedCreature}
            />
            <KillFeed kills={state?.recentKills || []} />
          </div>
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
          <GenomeStats creatures={state?.creatures || []} />
        </div>

        <ControlPanel
          config={config}
          stats={state?.stats || null}
          creatures={state?.creatures || []}
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
        fontSize: '11px',
        textAlign: 'center',
        maxWidth: '900px',
        lineHeight: '1.6',
      }}>
        Watch artificial creatures evolve in real-time. Click to inspect creatures.
        <br />
        <span style={{ color: '#888' }}>
          Shortcuts: Space=Pause, R=Reset, 1-4=Speed, C=Color Mode, F=Fullscreen, Esc=Deselect
        </span>
      </footer>
    </div>
  );
}

export default App;
