import { useCallback, useEffect, useState } from 'react';

// Milliseconds between steps for speed 1 (slowest) … 10 (fastest).
const DELAYS = [1100, 750, 500, 330, 220, 140, 85, 45, 20, 6];
const SPEED_KEY = 'alds-speed';

const readSpeed = () => {
  try {
    const v = Number(localStorage.getItem(SPEED_KEY));
    return v >= 1 && v <= 10 ? v : 6;
  } catch {
    return 6;
  }
};

/**
 * Steps through `run.frames`. Passing a new `run` object resets to the first
 * frame and starts playing if `run.autoplay` is true.
 */
export default function usePlayer(run) {
  const [state, setState] = useState({ run, index: 0, playing: run.autoplay });
  const [speed, setSpeedState] = useState(readSpeed);

  // Reset during render when a new run arrives, so effects never see stale state.
  let current = state;
  if (state.run !== run) {
    current = { run, index: 0, playing: run.autoplay };
    setState(current);
  }
  const { index, playing } = current;
  const last = run.frames.length - 1;

  useEffect(() => {
    if (!playing) return undefined;
    if (index >= last) {
      setState((s) => ({ ...s, playing: false }));
      return undefined;
    }
    const timer = setTimeout(() => {
      setState((s) => ({ ...s, index: Math.min(s.index + 1, last) }));
    }, DELAYS[speed - 1]);
    return () => clearTimeout(timer);
  }, [playing, index, speed, last]);

  const play = useCallback(() => {
    setState((s) => ({ ...s, playing: true, index: s.index >= s.run.frames.length - 1 ? 0 : s.index }));
  }, []);
  const pause = useCallback(() => setState((s) => ({ ...s, playing: false })), []);
  const toggle = useCallback(() => {
    setState((s) => (s.playing
      ? { ...s, playing: false }
      : { ...s, playing: true, index: s.index >= s.run.frames.length - 1 ? 0 : s.index }));
  }, []);
  const goTo = useCallback((i) => {
    setState((s) => ({ ...s, playing: false, index: Math.max(0, Math.min(s.run.frames.length - 1, i)) }));
  }, []);
  const step = useCallback((delta) => {
    setState((s) => ({ ...s, playing: false, index: Math.max(0, Math.min(s.run.frames.length - 1, s.index + delta)) }));
  }, []);
  const setSpeed = useCallback((v) => {
    setSpeedState(v);
    try { localStorage.setItem(SPEED_KEY, String(v)); } catch { /* storage unavailable */ }
  }, []);

  return {
    frame: run.frames[Math.min(index, last)],
    index: Math.min(index, last),
    total: run.frames.length,
    playing,
    speed,
    play,
    pause,
    toggle,
    goTo,
    step,
    setSpeed,
  };
}
