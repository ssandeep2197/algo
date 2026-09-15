import { num } from './recorder';

// Code shown in the UI is what each run() below steps through.

const round2 = (v) => Math.round(v * 100) / 100;

const circleTangents = {
  id: 'circle-tangents', name: 'Tangents between circles', kind: 'geo', bo: 'O(1)',
  chips: [['time', 'O(1)'], ['returns', 'up to 4 segments']],
  blurb: 'Two circles share up to four tangent lines: two outer ones that don’t cross between the circles and two inner ones that do. Each comes from rotating the unit vector between the centres.',
  inputs: [['x1', 'x₁', 0], ['y1', 'y₁', 0], ['r1', 'r₁', 3], ['x2', 'x₂', 9], ['y2', 'y₂', 2], ['r2', 'r₂', 1.5]],
  legend: [['move', 'Outer tangent (sign1 = +1)'], ['pivot', 'Inner tangent (sign1 = −1)']], stats: [['c', 'tangents']],
  code: `
const sqd = ((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2));
if (sqd <= (r1 - r2) * (r1 - r2)) return [[], [], [], []]; #nested
const dist = Math.sqrt(sqd);
const vx = (x2 - x1) / dist;
const vy = (y2 - y1) / dist;                            #dir
for (let sign1 = +1; sign1 >= -1; sign1 -= 2) {
  const c = (r1 - (sign1 * r2)) / dist;                 #c
  if (c * c > 1.0) continue;                            #skip
  const h = Math.sqrt(Math.max(0.0, 1.0 - (c * c)));
  for (let sign2 = +1; sign2 >= -1; sign2 -= 2) {
    const nx = (vx * c) - (sign2 * h * vy);
    const ny = (vy * c) + (sign2 * h * vx);
    res[i].push(x1 + (r1 * nx), y1 + (r1 * ny),
      x2 + (sign1 * r2 * nx), y2 + (sign1 * r2 * ny));  #push
  }
}`,
  run(p) {
    const x1 = num(p.x1, 0);
    const y1 = num(p.y1, 0);
    const r1 = Math.abs(num(p.r1, 3));
    const x2 = num(p.x2, 9);
    const y2 = num(p.y2, 2);
    const r2 = Math.abs(num(p.r2, 1.5));
    const circles = [[x1, y1, r1], [x2, y2, r2]];
    const lines = [];
    const frames = [];
    const snap = (line, msg, extra = {}) => frames.push({ circles, lines: lines.slice(), line, msg, c: lines.length, ...extra });

    const sqd = (x1 - x2) ** 2 + (y1 - y2) ** 2;
    snap('nested', `Squared distance between centres = **${round2(sqd)}**`);
    if (sqd <= (r1 - r2) ** 2) {
      snap('nested', 'One circle sits inside the other → no tangents');
      return frames;
    }
    const dist = Math.sqrt(sqd);
    const vx = (x2 - x1) / dist;
    const vy = (y2 - y1) / dist;
    snap('dir', `dist = **${round2(dist)}**, unit vector v = (${round2(vx)}, ${round2(vy)})`, { showDir: true });

    for (let s1 = 1; s1 >= -1; s1 -= 2) {
      const kind = s1 > 0 ? 'outer' : 'inner';
      const c = (r1 - s1 * r2) / dist;
      snap('c', `sign1 = ${s1 > 0 ? '+1' : '−1'} (${kind}): c = (r₁ ${s1 > 0 ? '−' : '+'} r₂) / dist = **${round2(c)}**`, { showDir: true, loop: `sign1 = ${s1}` });
      if (c * c > 1) {
        snap('skip', `c² > 1 → the circles overlap, no ${kind} tangents`, { showDir: true, loop: `sign1 = ${s1}` });
        continue;
      }
      const h = Math.sqrt(Math.max(0, 1 - c * c));
      for (let s2 = 1; s2 >= -1; s2 -= 2) {
        const nx = vx * c - s2 * h * vy;
        const ny = vy * c + s2 * h * vx;
        const pts = [x1 + r1 * nx, y1 + r1 * ny, x2 + s1 * r2 * nx, y2 + s1 * r2 * ny];
        lines.push({ pts, outer: s1 > 0 });
        snap('push', `Tangent ${lines.length}: (${round2(pts[0])}, ${round2(pts[1])}) → (${round2(pts[2])}, ${round2(pts[3])})`, { showDir: true, loop: `sign1 = ${s1} · sign2 = ${s2}` });
      }
    }
    snap(null, `Found **${lines.length}** tangent segment${lines.length === 1 ? '' : 's'}`, { showDir: true });
    return frames;
  },
};

export default [circleTangents];
