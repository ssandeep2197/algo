import { Rec, tagsOf } from './recorder';

// Code shown in the UI is what each run() below steps through.

const SEARCH_LEGEND = [['cmp', 'Probe'], ['done', 'Found'], ['bar', 'Still in the search window']];
const SEARCH_STATS = [['c', 'probes']];
const sortedChips = (time) => [['time', time], ['space', 'O(1)'], ['', 'needs sorted input']];

// Binary search frames, reused by exponential search (which highlights one line for all of it).
const binaryFrames = (T, arr, x, lo, hi, lineFor = (t) => t) => {
  let left = lo;
  let right = hi;
  while (left <= right) {
    const mid = left + ((right - left) >> 1);
    T.c++;
    const loop = `left = ${left} · mid = ${mid} · right = ${right}`;
    const tags = tagsOf([[left, 'lo'], [mid, 'mid'], [right, 'hi']]);
    T.snap(lineFor('mid'), `Window [${left}…${right}], mid = ${mid}, a[mid] = **${arr[mid]}**`, { range: [left, right], marks: { [mid]: 'cmp' }, tags, loop });
    if (arr[mid] === x) {
      T.snap(lineFor('found'), `a[${mid}] === ${x} → found at index **${mid}**`, { range: [left, right], marks: { [mid]: 'done' }, tags, loop, found: mid });
      return;
    }
    if (arr[mid] < x) {
      T.snap(lineFor('right'), `${arr[mid]} < ${x} → drop the left half, left = ${mid + 1}`, { range: [mid + 1, right], marks: { [mid]: 'cmp' }, loop });
      left = mid + 1;
    } else {
      T.snap(lineFor('left'), `${arr[mid]} > ${x} → drop the right half, right = ${mid - 1}`, { range: [left, mid - 1], marks: { [mid]: 'cmp' }, loop });
      right = mid - 1;
    }
  }
  T.snap(lineFor('miss'), `Window is empty, so ${x} is not present → return **-1**`, { range: [0, -1], found: -1 });
};

const linearSearch = {
  id: 'linear-search', name: 'Linear search', kind: 'cells', bo: 'O(n)',
  chips: [['time', 'O(n)'], ['space', 'O(1)'], ['', 'any order']],
  blurb: 'Check every element from left to right until one equals the target. The simplest search, and the only one here that does not need a sorted array.',
  legend: SEARCH_LEGEND, stats: SEARCH_STATS,
  code: `
const len = array.length;
for (let i = 0; i < len; i += 1) {
  if (array[i] === element) {                           #cmp
    return i;                                           #found
  }
}
return -1;                                              #miss`,
  run({ arr, x }) {
    const T = new Rec(arr);
    for (let i = 0; i < arr.length; i++) {
      T.c++;
      T.snap('cmp', `Is a[${i}] = **${arr[i]}** equal to ${x}?`, { marks: { [i]: 'cmp' }, range: [i, arr.length - 1], tags: { [i]: 'i' }, loop: `i = ${i}` });
      if (arr[i] === x) {
        T.snap('found', `Found ${x} at index **${i}**`, { marks: { [i]: 'done' }, tags: { [i]: 'i' }, found: i });
        return T.frames;
      }
    }
    T.snap('miss', `Reached the end, ${x} is not present → return **-1**`, { range: [0, -1], found: -1 });
    return T.frames;
  },
};

const binarySearch = {
  id: 'binary-search', name: 'Binary search', kind: 'cells', bo: 'O(log n)',
  chips: sortedChips('O(log n)'),
  blurb: 'Look at the middle of the window. If it is too small the target can only be to the right, if too large only to the left. Each probe halves what is left.',
  legend: SEARCH_LEGEND, stats: SEARCH_STATS,
  code: `
while (left <= right) {
  const mid = (left) + ((right - left) >> 1);           #mid
  if (sortedArray[mid] === element) {
    return mid;                                         #found
  }
  if (sortedArray[mid] < element) {
    left = mid + 1;                                     #right
  } else {
    right = mid - 1;                                    #left
  }
}
return -1;                                              #miss`,
  run({ arr, x }) {
    const T = new Rec(arr);
    binaryFrames(T, arr, x, 0, arr.length - 1);
    return T.frames;
  },
};

const jumpSearch = {
  id: 'jump-search', name: 'Jump search', kind: 'cells', bo: 'O(√n)',
  chips: sortedChips('O(√n)'),
  blurb: 'Jump ahead in blocks of √n, checking only the last element of each block. Once a block end is not smaller than the target, walk that one block linearly.',
  legend: SEARCH_LEGEND, stats: SEARCH_STATS,
  code: `
let step = Math.floor(Math.sqrt(len));                  #init
let prev = 0;
while (sortedArray[Math.min(step, len) - 1] < element) { #jump
  prev = step;
  step += Math.floor(Math.sqrt(len));                   #advance
  if (prev >= len) return -1;                           #miss
}
while (sortedArray[prev] < element) {                   #scan
  prev += 1;
  if (prev === Math.min(step, len)) return -1;          #miss2
}
if (sortedArray[prev] === element) return prev;         #found
return -1;                                              #end`,
  run({ arr, x }) {
    const T = new Rec(arr);
    const len = arr.length;
    const s = Math.floor(Math.sqrt(len));
    let step = s;
    let prev = 0;
    T.snap('init', `Block size = ⌊√${len}⌋ = **${s}**`, { loop: `prev = 0 · step = ${s}` });
    for (;;) {
      const idx = Math.min(step, len) - 1;
      T.c++;
      T.snap('jump', `Block end a[${idx}] = **${arr[idx]}** < ${x}?`, { range: [prev, idx], marks: { [idx]: 'cmp' }, tags: tagsOf([[prev, 'prev'], [idx, 'end']]), loop: `prev = ${prev} · step = ${step}` });
      if (!(arr[idx] < x)) break;
      prev = step;
      step += s;
      if (prev >= len) {
        T.snap('miss', 'Jumped past the end → return **-1**', { range: [0, -1], found: -1 });
        return T.frames;
      }
      T.snap('advance', `Yes → jump to the next block: prev = ${prev}, step = ${step}`, { range: [prev, Math.min(step, len) - 1], loop: `prev = ${prev} · step = ${step}` });
    }
    const end = Math.min(step, len) - 1;
    for (;;) {
      T.c++;
      T.snap('scan', `Scan: a[${prev}] = **${arr[prev]}** < ${x}?`, { range: [prev, end], marks: { [prev]: 'cmp' }, tags: { [prev]: 'prev' }, loop: `prev = ${prev} · step = ${step}` });
      if (!(arr[prev] < x)) break;
      prev++;
      if (prev === Math.min(step, len)) {
        T.snap('miss2', 'Walked off the block → return **-1**', { range: [0, -1], found: -1 });
        return T.frames;
      }
    }
    if (arr[prev] === x) T.snap('found', `a[${prev}] === ${x} → found at index **${prev}**`, { marks: { [prev]: 'done' }, tags: { [prev]: 'prev' }, found: prev });
    else T.snap('end', `a[${prev}] = ${arr[prev]} overshoots ${x} → return **-1**`, { range: [0, -1], found: -1 });
    return T.frames;
  },
};

const interpolationSearch = {
  id: 'interpolation-search', name: 'Interpolation search', kind: 'cells', bo: 'O(log log n)',
  chips: sortedChips('O(log log n) avg'),
  blurb: 'Like looking up a word in a dictionary: guess where the target should sit by its value relative to both ends of the window, instead of always probing the middle.',
  legend: SEARCH_LEGEND, stats: SEARCH_STATS,
  code: `
while ((left <= right) && (element >= sortedArray[left])
       && (element <= sortedArray[right])) {
  const valDiff = sortedArray[right] - sortedArray[left];
  const posDiff = right - left;
  const elementDiff = element - sortedArray[left];
  const pos = left + Math.floor((posDiff * elementDiff) / valDiff || 0); #pos
  if (sortedArray[pos] === element) return pos;         #found
  if (sortedArray[pos] < element) left = pos + 1;       #right
  else right = pos - 1;                                 #left
}
return -1;                                              #miss`,
  run({ arr, x }) {
    const T = new Rec(arr);
    let left = 0;
    let right = arr.length - 1;
    while (left <= right && x >= arr[left] && x <= arr[right]) {
      const pos = left + Math.floor(((right - left) * (x - arr[left])) / (arr[right] - arr[left]) || 0);
      T.c++;
      const loop = `left = ${left} · pos = ${pos} · right = ${right}`;
      const tags = tagsOf([[left, 'lo'], [pos, 'pos'], [right, 'hi']]);
      T.snap('pos', `pos = ${left} + ⌊${right - left} × ${x - arr[left]} / ${arr[right] - arr[left]}⌋ = **${pos}**, a[pos] = **${arr[pos]}**`, { range: [left, right], marks: { [pos]: 'cmp' }, tags, loop });
      if (arr[pos] === x) {
        T.snap('found', `a[${pos}] === ${x} → found at index **${pos}**`, { range: [left, right], marks: { [pos]: 'done' }, tags, loop, found: pos });
        return T.frames;
      }
      if (arr[pos] < x) {
        left = pos + 1;
        T.snap('right', `${arr[pos]} < ${x} → left = ${left}`, { range: [left, right], loop });
      } else {
        right = pos - 1;
        T.snap('left', `${arr[pos]} > ${x} → right = ${right}`, { range: [left, right], loop });
      }
    }
    T.snap('miss', `${x} can't be inside the window → return **-1**`, { range: [0, -1], found: -1 });
    return T.frames;
  },
};

const exponentialSearch = {
  id: 'exponential-search', name: 'Exponential search', kind: 'cells', bo: 'O(log i)',
  chips: sortedChips('O(log i)'),
  blurb: 'Double an index, 1, 2, 4, 8…, until it passes the target, then binary-search the last doubling. Fast when the target sits near the front of a long array.',
  legend: SEARCH_LEGEND, stats: SEARCH_STATS,
  code: `
if (sortedArray[0] === element) {                       #first
  return 0;
}
const len = sortedArray.length;
let i = 1;
while (i < len && sortedArray[i] < element) {           #probe
  i *= 2;                                               #double
}
return binarysearch(sortedArray, element,
  Math.floor(i / 2), Math.min(i, len));                 #binary`,
  run({ arr, x }) {
    const T = new Rec(arr);
    const len = arr.length;
    T.c++;
    T.snap('first', `Is a[0] = **${arr[0]}** the target?`, { marks: { 0: 'cmp' }, tags: { 0: 'i' } });
    if (arr[0] === x) {
      T.snap('first', `Found ${x} at index **0**`, { marks: { 0: 'done' }, found: 0 });
      return T.frames;
    }
    let i = 1;
    while (i < len) {
      T.c++;
      T.snap('probe', `a[${i}] = **${arr[i]}** < ${x}?`, { marks: { [i]: 'cmp' }, range: [0, Math.min(i * 2, len - 1)], tags: { [i]: 'i' }, loop: `i = ${i}` });
      if (!(arr[i] < x)) break;
      i *= 2;
      T.snap('double', `Yes → double: i = **${i}**`, { range: [0, Math.min(i, len - 1)], tags: i < len ? { [i]: 'i' } : {}, loop: `i = ${i}` });
    }
    const lo = Math.floor(i / 2);
    const hi = Math.min(i, len - 1);
    T.snap('binary', `Target is between index ${lo} and ${hi} → binary search that range`, { range: [lo, hi], tags: tagsOf([[lo, 'lo'], [hi, 'hi']]), loop: `i = ${i}` });
    binaryFrames(T, arr, x, lo, hi, () => 'binary');
    return T.frames;
  },
};

const ternarySearch = {
  id: 'ternary-search', name: 'Ternary search', kind: 'cells', bo: 'O(log₃ n)',
  chips: sortedChips('O(log₃ n)'),
  blurb: 'Probe two points that cut the window into thirds. Depending on where the target falls, keep only the left, middle, or right third.',
  legend: SEARCH_LEGEND, stats: SEARCH_STATS,
  code: `
while (left <= right) {
  const firstMid = (left) + Math.floor((right - left) / 3);
  const secondMid = (firstMid) + Math.floor((right - left) / 3); #mids
  if (sortedArray[firstMid] === element) return firstMid;   #found
  if (sortedArray[secondMid] === element) return secondMid; #found2
  if (sortedArray[firstMid] > element) {
    right = firstMid - 1;                               #keepL
  } else if (sortedArray[secondMid] < element) {
    left = secondMid + 1;                               #keepR
  } else {
    left = firstMid + 1; right = secondMid - 1;         #keepM
  }
}
return -1;                                              #miss`,
  run({ arr, x }) {
    const T = new Rec(arr);
    let left = 0;
    let right = arr.length - 1;
    while (left <= right) {
      const m1 = left + Math.floor((right - left) / 3);
      const m2 = m1 + Math.floor((right - left) / 3);
      T.c += 2;
      const loop = `left = ${left} · m1 = ${m1} · m2 = ${m2} · right = ${right}`;
      const tags = tagsOf([[left, 'lo'], [m1, 'm1'], [m2, 'm2'], [right, 'hi']]);
      const range = [left, right];
      T.snap('mids', `Thirds: a[${m1}] = **${arr[m1]}**, a[${m2}] = **${arr[m2]}**`, { range, marks: { [m1]: 'cmp', [m2]: 'cmp' }, tags, loop });
      if (arr[m1] === x) {
        T.snap('found', `a[${m1}] === ${x} → found at index **${m1}**`, { range, marks: { [m1]: 'done' }, tags, loop, found: m1 });
        return T.frames;
      }
      if (arr[m2] === x) {
        T.snap('found2', `a[${m2}] === ${x} → found at index **${m2}**`, { range, marks: { [m2]: 'done' }, tags, loop, found: m2 });
        return T.frames;
      }
      if (arr[m1] > x) {
        right = m1 - 1;
        T.snap('keepL', `${x} < ${arr[m1]} → keep the left third`, { range: [left, right], loop });
      } else if (arr[m2] < x) {
        left = m2 + 1;
        T.snap('keepR', `${x} > ${arr[m2]} → keep the right third`, { range: [left, right], loop });
      } else {
        left = m1 + 1;
        right = m2 - 1;
        T.snap('keepM', `${x} is between them → keep the middle third`, { range: [left, right], loop });
      }
    }
    T.snap('miss', 'Window is empty → return **-1**', { range: [0, -1], found: -1 });
    return T.frames;
  },
};

// Tree used by BFS and DFS: node → children, left to right.
export const TREE = {
  A: ['B', 'C', 'D'], B: ['E', 'F'], C: ['G'], D: ['H', 'I'], E: ['J', 'K'], F: [], G: ['L'], H: [], I: [], J: [], K: [], L: [],
};

const traverse = (bfs) => {
  const frames = [];
  const box = ['A'];
  const visited = [];
  const word = bfs ? 'queue' : 'stack';
  const snap = (line, msg, cur) => frames.push({
    line, msg, cur, box: box.slice(), visited: visited.slice(), c: visited.length, loop: `${word} = [${box.join(', ')}]`,
  });
  snap('init', `Push the root **A** onto the ${word}`, null);
  while (box.length) {
    const node = bfs ? box.shift() : box.pop();
    snap('pop', `${bfs ? 'Dequeue from the front' : 'Pop from the top'}: **${node}**`, node);
    visited.push(node);
    snap('visit', `callback(${node}) → visit order ${visited.join(' ')}`, node);
    TREE[node].forEach((child) => {
      box.push(child);
      snap('push', `Push child **${child}** of ${node}`, node);
    });
  }
  snap('done', `${word} is empty: visited all **${visited.length}** nodes`, null);
  return frames;
};

const TREE_LEGEND = [['move', 'Current node'], ['cmp', 'Waiting in queue/stack'], ['done', 'Visited']];
const traversalCode = (v, Cls) => `
const ${v} = new ${Cls}();
${v}.push(root);                                           #init
while (!${v}.isEmpty()) {
  node = ${v}.pop();                                       #pop
  callback(node);                                       #visit
  const children = node[childProp];
  for (let i = 0; i < children.length; i += 1) {
    ${v}.push(children[i]);                                #push
  }
}                                                       #done`;

const bfs = {
  id: 'bfs', name: 'Breadth-first search', kind: 'tree', bo: 'O(V+E)', structure: 'queue',
  chips: [['time', 'O(V + E)'], ['space', 'O(width)'], ['', 'Queue']],
  blurb: 'Visit the tree level by level. A queue (first in, first out) means every node’s children wait behind the nodes already discovered.',
  legend: TREE_LEGEND, stats: [['c', 'visited']],
  code: traversalCode('q', 'Queue'),
  run: () => traverse(true),
};

const dfs = {
  id: 'dfs', name: 'Depth-first search', kind: 'tree', bo: 'O(V+E)', structure: 'stack',
  chips: [['time', 'O(V + E)'], ['space', 'O(depth)'], ['', 'Stack']],
  blurb: 'Same loop as BFS with a stack instead of a queue. The last child pushed is popped first, so this version dives down the right-most branch first.',
  legend: TREE_LEGEND, stats: [['c', 'visited']],
  code: traversalCode('s', 'Stack'),
  run: () => traverse(false),
};

export default [linearSearch, binarySearch, jumpSearch, interpolationSearch, exponentialSearch, ternarySearch, bfs, dfs];
