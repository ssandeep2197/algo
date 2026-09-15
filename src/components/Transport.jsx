const Icon = ({ d }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true"><path d={d} /></svg>
);

const ICONS = {
  start: 'M2 2h2v12H2zM14 2v12L5 8z',
  back: 'M12 2v12L3 8z',
  play: 'M4 2v12l10-6z',
  pause: 'M3 2h4v12H3zM9 2h4v12H9z',
  forward: 'M4 2v12l9-6z',
  end: 'M12 2h2v12h-2zM2 2v12l9-6z',
};

export default function Transport({ player }) {
  const { index, total, playing, speed } = player;
  return (
    <div className="console">
      <div className="transport">
        <button type="button" className="tbtn" title="Back to start (Home)" aria-label="Back to start" onClick={() => player.goTo(0)}>
          <Icon d={ICONS.start} />
        </button>
        <button type="button" className="tbtn" title="Step back (←)" aria-label="Step back" onClick={() => player.step(-1)}>
          <Icon d={ICONS.back} />
        </button>
        <button type="button" className="tbtn play" title="Play / pause (Space)" aria-label={playing ? 'Pause' : 'Play'} onClick={player.toggle}>
          <Icon d={playing ? ICONS.pause : ICONS.play} />
        </button>
        <button type="button" className="tbtn" title="Step forward (→)" aria-label="Step forward" onClick={() => player.step(1)}>
          <Icon d={ICONS.forward} />
        </button>
        <button type="button" className="tbtn" title="Jump to end (End)" aria-label="Jump to end" onClick={() => player.goTo(total - 1)}>
          <Icon d={ICONS.end} />
        </button>
      </div>
      <div className="scrub">
        <input
          type="range" id="scrub" aria-label="Step" min="0" max={total - 1} value={index}
          onChange={(e) => player.goTo(Number(e.target.value))}
        />
        <span className="counter">step {index + 1} / {total}</span>
      </div>
      <label className="field" htmlFor="speed">
        Speed
        <input type="range" id="speed" min="1" max="10" value={speed} onChange={(e) => player.setSpeed(Number(e.target.value))} />
      </label>
    </div>
  );
}
