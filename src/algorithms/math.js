import { table, int } from './recorder';

// Code shown in the UI is what each run() below steps through.

const MAX_ROWS = 300;
const MATH_LEGEND = [['cmp', 'Current row']];

// Subtraction-based gcd, one row per recursive call.
const gcdRows = (t, x, y, line) => {
  let a = Math.abs(x);
  let b = Math.abs(y);
  for (;;) {
    if (t.rows.length > MAX_ROWS) {
      t.snap(line || 'subA', `Stopped after ${MAX_ROWS} subtractions. Try smaller numbers.`);
      return null;
    }
    const call = `gcd(${a}, ${b})`;
    if (a === 0 || b === 0) {
      t.push([call, a, b, 'return 0'], line || 'zero', 'A zero argument → return **0**');
      return 0;
    }
    if (a === b) {
      t.push([call, a, b, `return ${a}`], line || 'equal', `a === b → gcd is **${a}**`);
      return a;
    }
    if (a > b) {
      t.push([call, a, b, `a − b = ${a - b}`], line || 'subA', `${a} > ${b} → recurse on gcd(**${a - b}**, ${b})`);
      a -= b;
    } else {
      t.push([call, a, b, `b − a = ${b - a}`], line || 'subB', `${b} > ${a} → recurse on gcd(${a}, **${b - a}**)`);
      b -= a;
    }
  }
};

const gcd = {
  id: 'gcd', name: 'GCD', kind: 'table', bo: 'O(max(a,b))',
  chips: [['time', 'O(max(a, b))'], ['', 'subtraction form']],
  blurb: 'Euclid’s original method: the greatest common divisor of a and b doesn’t change if you subtract the smaller from the larger. Repeat until both are equal.',
  inputs: [['a', 'a', 252], ['b', 'b', 105]], legend: MATH_LEGEND, stats: [['c', 'calls']],
  code: `
const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  if (a === 0 || b === 0) return 0;                     #zero
  if (a === b) return a;                                #equal
  if (a > b) return gcd(a - b, b);                      #subA
  return gcd(a, b - a);                                 #subB
};`,
  run({ a, b }) {
    const t = table(['call', 'a', 'b', 'next']);
    const g = gcdRows(t, int(a, 0), int(b, 0));
    if (g !== null) t.snap('equal', `gcd(${a}, ${b}) = **${g}**`, { result: `gcd = ${g}` });
    return t.frames;
  },
};

const lcm = {
  id: 'lcm', name: 'LCM', kind: 'table', bo: 'O(max(a,b))',
  chips: [['time', 'O(max(a, b))'], ['', 'via gcd']],
  blurb: 'The least common multiple is a × b divided by their gcd, so the work is the gcd computation followed by one division.',
  inputs: [['a', 'a', 21], ['b', 'b', 6]], legend: MATH_LEGEND, stats: [['c', 'calls']],
  code: `
const lcm = (a, b) => {
  if (a === 0 || b === 0) return 0;                     #zero
  a = Math.abs(a);
  b = Math.abs(b);
  return (a * b) / gcd(a, b);                           #ret
};`,
  run(p) {
    const a = int(p.a, 0);
    const b = int(p.b, 0);
    const t = table(['call', 'a', 'b', 'next']);
    if (a === 0 || b === 0) {
      t.push(['lcm', a, b, 'return 0'], 'zero', 'A zero argument → return **0**', { result: 'lcm = 0' });
      return t.frames;
    }
    const g = gcdRows(t, a, b, 'ret');
    if (g !== null) {
      const product = Math.abs(a * b);
      const l = product / g;
      t.push([`lcm(${a}, ${b})`, product, g, `÷ → ${l}`], 'ret', `(${Math.abs(a)} × ${Math.abs(b)}) / ${g} = **${l}**`, { result: `lcm = ${l}` });
    }
    return t.frames;
  },
};

// Extended Euclid, one row per half-step, in the same order as the code shown.
const extRows = (t, a0, b0) => {
  const floor = (v) => (v >= 0 || -1) * Math.floor(Math.abs(v));
  let a = a0;
  let b = b0;
  let x = 1;
  let y = 0;
  let m = 0;
  let n = 1;
  let q;
  t.push(['start', '', a, b, x, y, m, n], 'init', 'Start with x = 1, y = 0, m = 0, n = 1');
  if (a === 0) { t.snap('zero', `a is 0 → gcd = **${b}**`); return { gcd: b, x: y, y: n }; }
  if (b === 0) { t.snap('zero', `b is 0 → gcd = **${a}**`); return { gcd: a, x, y: m }; }
  for (;;) {
    q = floor(a / b);
    a %= b;
    x -= q * y;
    m -= q * n;
    t.push(['a %= b', q, a, b, x, y, m, n], 'upd1', `q = **${q}**, a = a mod b = **${a}**, x -= q·y → ${x}, m -= q·n → ${m}`);
    if (a === 0) { t.snap('end1', `a reached 0 → gcd = **${b}**, x = ${y}, y = ${n}`); return { gcd: b, x: y, y: n }; }
    q = floor(b / a);
    b %= a;
    y -= q * x;
    n -= q * m;
    t.push(['b %= a', q, a, b, x, y, m, n], 'upd2', `q = **${q}**, b = b mod a = **${b}**, y -= q·x → ${y}, n -= q·m → ${n}`);
    if (b === 0) { t.snap('end2', `b reached 0 → gcd = **${a}**, x = ${x}, y = ${m}`); return { gcd: a, x, y: m }; }
  }
};

const EXT_COLS = ['step', 'q', 'a', 'b', 'x', 'y', 'm', 'n'];

const extendedEuclidean = {
  id: 'extended-euclidean', name: 'Extended Euclidean', kind: 'table', bo: 'O(log n)',
  chips: [['time', 'O(log min(a, b))'], ['returns', '{ gcd, x, y }']],
  blurb: 'Runs the remainder form of Euclid’s algorithm while tracking coefficients, ending with gcd(a, b) and integers x, y such that a·x + b·y = gcd.',
  inputs: [['a', 'a', 240], ['b', 'b', 46]], legend: MATH_LEGEND, stats: [['c', 'rows']],
  code: `
let x = 1, y = 0, m = 0, n = 1;                         #init
if (a === 0) return { gcd: b, x: y, y: n };             #zero
while (terminate) {
  q = floor(a / b); a %= b;
  x -= q * y; m -= q * n;                               #upd1
  if (a === 0) { result = { gcd: b, x: y, y: n }; break; } #end1
  q = floor(b / a); b %= a;
  y -= q * x; n -= q * m;                               #upd2
  if (b === 0) { result = { gcd: a, x, y: m }; break; }   #end2
}
return result;`,
  run(p) {
    const a = int(p.a, 0);
    const b = int(p.b, 0);
    const t = table(EXT_COLS);
    const r = extRows(t, a, b);
    t.snap(null, `${a}·(**${r.x}**) + ${b}·(**${r.y}**) = **${a * r.x + b * r.y}**`, { result: `gcd = ${r.gcd} · x = ${r.x} · y = ${r.y}` });
    return t.frames;
  },
};

const fastExp = {
  id: 'fast-exp', name: 'Fast exponentiation', kind: 'table', bo: 'O(log e)',
  chips: [['time', 'O(log e)'], ['', 'square and multiply']],
  blurb: 'Compute aᵉ mod m by reading e in binary. Square a at every bit, and multiply it into the result only when that bit is 1. That takes about log₂ e steps instead of e.',
  inputs: [['a', 'a', 3], ['e', 'e', 13], ['mod', 'mod', 1000]], legend: MATH_LEGEND, stats: [['c', 'bits']],
  code: `
const fastexp = (a, e, mod = 1e9 + 7) => {
  if (a === 0 && e === 0) return undefined;             #undef
  let res = 1;                                          #init
  while (e !== 0) {
    if (e % 2 === 1) res = (res * a) % mod;             #mul
    a = (a * a) % mod;                                  #sq
    e >>= 1;                                            #shift
  }
  return res % mod;                                     #ret
};`,
  run(p) {
    const a0 = int(p.a, 0);
    const e0 = Math.max(0, int(p.e, 0));
    const mod = Math.max(1, int(p.mod, 1000));
    const t = table(['e (binary)', 'low bit', 'res', 'a']);
    if (a0 === 0 && e0 === 0) {
      t.snap('undef', '0⁰ is undefined → return undefined', { result: 'undefined' });
      return t.frames;
    }
    let a = a0;
    let e = e0;
    let res = 1;
    t.push([e.toString(2), '', res, a], 'init', `res = 1, a = ${a}, e = ${e} = **${e.toString(2)}**₂`);
    while (e !== 0) {
      const bit = e % 2;
      if (bit === 1) {
        res = (res * a) % mod;
        t.push([e.toString(2), 1, res, a], 'mul', `Low bit is 1 → res = res × a mod ${mod} = **${res}**`);
      } else {
        t.push([e.toString(2), 0, res, a], 'mul', `Low bit is 0 → res stays ${res}`);
      }
      a = (a * a) % mod;
      t.rows[t.rows.length - 1][3] = a;
      t.snap('sq', `Square: a = a² mod ${mod} = **${a}**`);
      e >>= 1;
      t.snap('shift', `Shift e right → ${e ? `${e.toString(2)}₂` : '0, done'}`);
    }
    t.snap('ret', `${a0}^${e0} mod ${mod} = **${res % mod}**`, { result: `${a0}^${e0} mod ${mod} = ${res % mod}` });
    return t.frames;
  },
};

const modularInverse = {
  id: 'modular-inverse', name: 'Modular inverse', kind: 'table', bo: 'O(log m)',
  chips: [['time', 'O(log m)'], ['', 'via extended Euclid']],
  blurb: 'Find x with a·x ≡ 1 (mod m). Extended Euclid gives a·x + m·y = gcd. When the gcd is 1, x mod m is the inverse; otherwise none exists.',
  inputs: [['a', 'a', 17], ['m', 'm', 3120]], legend: MATH_LEGEND, stats: [['c', 'rows']],
  code: `
const modularInverse = (a, m) => {
  if (a === 0 || m === 0) return null;                  #zero
  const result = exEuclidean(a, m);                     #ext
  if (result.gcd !== 1) return null;                    #nogcd
  return (result.x + m) % m;                            #ret
};`,
  run(p) {
    const a = int(p.a, 0);
    const m = int(p.m, 0);
    const t = table(EXT_COLS);
    if (a === 0 || m === 0) {
      t.snap('zero', 'A zero argument → return **null**', { result: 'null' });
      return t.frames;
    }
    const r = extRows(t, a, m);
    t.frames.forEach((f) => { f.line = 'ext'; });
    if (r.gcd !== 1) {
      t.snap('nogcd', `gcd(${a}, ${m}) = ${r.gcd} ≠ 1 → no inverse, return **null**`, { result: 'null' });
      return t.frames;
    }
    const inv = (r.x + m) % m;
    t.snap('ret', `(x + m) % m = (${r.x} + ${m}) % ${m} = **${inv}**. Check: ${a}·${inv} mod ${m} = ${(a * inv) % m}`, { result: `${a}⁻¹ mod ${m} = ${inv}` });
    return t.frames;
  },
};

export default [gcd, lcm, extendedEuclidean, fastExp, modularInverse];
