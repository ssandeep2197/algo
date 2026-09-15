import sort from './sort';
import search from './search';
import math from './math';
import string from './string';
import geometry from './geometry';

// The one entry point for every algorithm. Each group lives in its own file here.
export { TREE } from './search';
export { rnd } from './recorder';

export const GROUPS = [
  { name: 'sort', algos: sort },
  { name: 'search', algos: search },
  { name: 'math', algos: math },
  { name: 'string', algos: string },
  { name: 'geometry', algos: geometry },
];

// Split each code sample into lines, pulling the trailing "#tag" off each line.
const parseCode = (code) => code.trim().split('\n').map((raw) => {
  const m = raw.match(/\s+#(\w+)\s*$/);
  return { text: m ? raw.slice(0, m.index) : raw, tag: m ? m[1] : null };
});

export const ALGOS = GROUPS.flatMap(({ name, algos }) => algos.map((a) => ({ ...a, group: name, lines: parseCode(a.code) })));

export const byId = Object.fromEntries(ALGOS.map((a) => [a.id, a]));

export const DEFAULT_ID = 'merge-sort';
