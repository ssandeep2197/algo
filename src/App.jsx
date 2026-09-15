import { useEffect, useMemo, useRef, useState } from 'react';
import { ALGOS, GROUPS, byId, DEFAULT_ID } from './algorithms';
import { makeSortData, makeSearchData, defaultInputs, inputFor } from './data';
import usePlayer from './hooks/usePlayer';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Params from './components/Params';
import Stage from './components/Stage';
import Transport from './components/Transport';
import CodePane from './components/CodePane';
import Stats from './components/Stats';
import StepLog from './components/StepLog';

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const idFromHash = () => {
  const id = window.location.hash.slice(1);
  return byId[id] ? id : DEFAULT_ID;
};

export default function App() {
  const [algoId, setAlgoId] = useState(idFromHash);
  const [sort, setSort] = useState(() => {
    const cfg = { size: 32, preset: 'random' };
    return { ...cfg, data: makeSortData(cfg) };
  });
  const [search, setSearch] = useState(() => makeSearchData(32));
  const [inputs, setInputs] = useState(() => defaultInputs(ALGOS));

  const algo = byId[algoId];

  // Only the data this algorithm actually reads should trigger a re-run.
  let source = null;
  if (algo.kind === 'bars') source = sort.data;
  else if (algo.kind === 'cells') source = search;
  else if (algo.inputs) source = inputs[algo.id];

  const run = useMemo(
    () => ({ frames: algo.run(inputFor(algo, { sort, search, inputs })), autoplay: !prefersReducedMotion() }),
    [algo, source],
  );
  const player = usePlayer(run);

  // Keep the URL hash in sync so a refresh or shared link opens the same algorithm.
  useEffect(() => {
    if (window.location.hash.slice(1) !== algoId) window.history.replaceState(null, '', `#${algoId}`);
  }, [algoId]);
  useEffect(() => {
    const onHash = () => setAlgoId(idFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Keyboard: Space play/pause, arrows step, Home/End jump.
  const playerRef = useRef(player);
  playerRef.current = player;
  useEffect(() => {
    const onKey = (e) => {
      const el = e.target;
      if (el.closest?.('input, select, textarea') && el.type !== 'range') return;
      const p = playerRef.current;
      const actions = {
        ' ': () => p.toggle(),
        ArrowRight: () => p.step(1),
        ArrowLeft: () => p.step(-1),
        Home: () => p.goTo(0),
        End: () => p.goTo(p.total - 1),
      };
      if (actions[e.key]) {
        e.preventDefault();
        actions[e.key]();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="app">
      <Sidebar groups={GROUPS} currentId={algoId} onSelect={setAlgoId} />

      <main className="view">
        <Header algo={algo} />

        <Params
          algo={algo}
          sort={sort}
          onSortChange={(cfg) => setSort({ ...cfg, data: makeSortData(cfg) })}
          search={search}
          onSearchChange={setSearch}
          values={inputs[algo.id]}
          onValuesChange={(values) => setInputs((all) => ({ ...all, [algo.id]: values }))}
        />

        <Stage algo={algo} player={player} frames={run.frames} target={search.target} />

        <Transport player={player} />

        <div className="lower">
          <section className="pane">
            <h3>Code, current line highlighted</h3>
            <CodePane lines={algo.lines} activeTag={player.frame.line} />
          </section>
          <section className="pane">
            <h3>Counters</h3>
            <Stats algo={algo} player={player} />
            <h3>Recent steps</h3>
            <StepLog frames={run.frames} index={player.index} />
            <p className="keys">
              <kbd>Space</kbd> play/pause · <kbd>←</kbd> <kbd>→</kbd> step · <kbd>Home</kbd> <kbd>End</kbd>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
