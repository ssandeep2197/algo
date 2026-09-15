// Shared helpers for turning an algorithm run into a list of frames.
// A frame is a snapshot the UI can render: the array, which indices are
// highlighted, which code line is running, and a message. Messages mark
// values with **double asterisks**, rendered bold by <Msg>.

export const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

export const int = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

export const num = (v, d) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
};

// Merge labels that land on the same index, e.g. lo and mid → "lo·mid".
export const tagsOf = (pairs) => {
  const t = {};
  pairs.forEach(([i, name]) => { t[i] = t[i] ? `${t[i]}·${name}` : name; });
  return t;
};

// Records frames for algorithms that work on a single array.
export class Rec {
  constructor(arr) {
    this.a = arr;
    this.frames = [];
    this.c = 0; // comparisons / probes
    this.w = 0; // writes
    this.done = new Set();
  }

  snap(line, msg, o = {}) {
    this.frames.push({
      arr: this.a.slice(),
      line,
      msg,
      c: this.c,
      w: this.w,
      done: [...this.done],
      marks: {},
      range: null,
      aux: null,
      loop: '',
      ...o,
    });
  }

  finish(line) {
    this.a.forEach((_, i) => this.done.add(i));
    this.snap(line, `Sorted: **${this.c}** comparisons, **${this.w}** writes`);
    return this.frames;
  }
}

// Records frames for algorithms whose state is a growing table of rows.
export const table = (cols) => {
  const rows = [];
  const frames = [];
  const frame = (line, msg, extra) => ({
    cols, rows: rows.map((r) => r.slice()), hi: rows.length - 1, line, msg, c: rows.length, ...extra,
  });
  return {
    rows,
    frames,
    push(row, line, msg, extra = {}) { rows.push(row); frames.push(frame(line, msg, extra)); },
    snap(line, msg, extra = {}) { frames.push(frame(line, msg, extra)); },
  };
};
