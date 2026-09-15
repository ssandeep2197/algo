import { rnd } from './algorithms';

export const PRESETS = [
  ['random', 'Random'],
  ['reversed', 'Reversed'],
  ['nearly', 'Nearly sorted'],
  ['few', 'Few unique'],
];

export const makeSortData = ({ size, preset }) => {
  let a = Array.from({ length: size }, () => rnd(5, 99));
  if (preset === 'reversed') a.sort((x, y) => y - x);
  if (preset === 'nearly') {
    a.sort((x, y) => x - y);
    for (let k = 0; k < Math.max(1, size / 8); k++) {
      const i = rnd(0, size - 2);
      [a[i], a[i + 1]] = [a[i + 1], a[i]];
    }
  }
  if (preset === 'few') {
    const vals = [18, 42, 67, 91];
    a = a.map(() => vals[rnd(0, 3)]);
  }
  return a;
};

// Sorted, distinct values with small random gaps.
export const makeSearchData = (size) => {
  const data = [];
  let v = rnd(1, 4);
  for (let i = 0; i < size; i++) {
    data.push(v);
    v += rnd(1, 5);
  }
  return { size, data, target: data[rnd(Math.floor(size * 0.55), size - 1)] };
};

export const pickPresent = (data) => data[rnd(0, data.length - 1)];

export const pickMissing = (data) => {
  const present = new Set(data);
  const lo = data[0];
  const hi = data[data.length - 1];
  if (present.size > hi - lo) return hi + 1;
  let v;
  do { v = rnd(lo, hi); } while (present.has(v));
  return v;
};

export const defaultInputs = (algos) => Object.fromEntries(
  algos.filter((a) => a.inputs).map((a) => [a.id, Object.fromEntries(a.inputs.map(([key, , value]) => [key, value]))]),
);

// What each kind of algorithm receives as its input. Always pass copies: runs mutate arrays.
export const inputFor = (algo, { sort, search, inputs }) => {
  if (algo.kind === 'bars') {
    // Count sort needs a small value range so its count array stays readable.
    return algo.smallValues ? sort.data.map((v) => Math.round(((v - 5) / 94) * 15)) : sort.data.slice();
  }
  if (algo.kind === 'cells') return { arr: search.data.slice(), x: search.target };
  if (algo.inputs) return { ...inputs[algo.id] };
  return {};
};
