import { Rec } from './recorder';

// Code shown in the UI is what each run() below steps through.
// A trailing "#tag" marks the line a frame highlights; the tag is not displayed.

const SORT_LEGEND = [['cmp', 'Comparing'], ['move', 'Writing / swapping'], ['pivot', 'Pivot · min · key'], ['done', 'In final place']];
const SORT_STATS = [['c', 'comparisons'], ['w', 'writes']];

const bubbleSort = {
  id: 'bubble-sort', name: 'Bubble sort', kind: 'bars', bo: 'O(n²)',
  chips: [['time', 'O(n²)'], ['best', 'O(n)'], ['space', 'O(1)'], ['', 'stable']],
  blurb: 'Walk the array comparing neighbours and swap any pair that is out of order. Each pass pushes the largest remaining value to the end; a pass with no swaps ends the sort early.',
  legend: SORT_LEGEND, stats: SORT_STATS,
  code: `
for (let i = 0; i < len - 1; i += 1) {                  #outer
  didSwap = false;
  for (let j = 0; j < len - i - 1; j += 1) {
    if (this._compareFunc(list[j + 1], list[j])) {      #cmp
      [list[j], list[j + 1]] = [list[j + 1], list[j]];  #swap
      didSwap = true;
    }
  }
  if (!didSwap) {                                       #early
    break;
  }
}
return list;                                            #ret`,
  run(a) {
    const T = new Rec(a);
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      let did = false;
      T.snap('outer', `Pass ${i + 1}: carry the largest unsorted value to index ${n - i - 1}`, { loop: `i = ${i}` });
      for (let j = 0; j < n - i - 1; j++) {
        T.c++;
        const sw = a[j + 1] < a[j];
        T.snap('cmp', `Is a[${j + 1}] = **${a[j + 1]}** < a[${j}] = **${a[j]}**? ${sw ? 'yes' : 'no'}`, { marks: { [j]: 'cmp', [j + 1]: 'cmp' }, loop: `i = ${i} · j = ${j}` });
        if (sw) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          T.w += 2;
          did = true;
          T.snap('swap', `Swap → a[${j}] = ${a[j]}, a[${j + 1}] = ${a[j + 1]}`, { marks: { [j]: 'move', [j + 1]: 'move' }, loop: `i = ${i} · j = ${j}` });
        }
      }
      T.done.add(n - i - 1);
      if (!did) {
        T.snap('early', `No swaps in pass ${i + 1}, so the array is sorted. Stop early.`, { loop: `i = ${i}` });
        break;
      }
    }
    return T.finish('ret');
  },
};

const countSort = {
  id: 'count-sort', name: 'Count sort', kind: 'bars', bo: 'O(n+k)', smallValues: true,
  chips: [['time', 'O(n + k)'], ['space', 'O(n + k)'], ['', 'integers only']],
  blurb: 'No comparisons at all. Tally how often each value appears, turn the tallies into running totals, then use each total as the slot where that value belongs. Here values run 0–15 so the count array stays readable.',
  legend: [['cmp', 'Reading'], ['move', 'Writing'], ['done', 'Copied back']], stats: [['w', 'writes']],
  code: `
const range = Math.max(...list);                        #max
const count = new Array(range + 1);
count.fill(0);
for (let i = 0; i < len; i += 1) {
  count[list[i]] += 1;                                  #tally
}
for (let i = 1; i <= range; i += 1) {
  count[i] += count[i - 1];                             #prefix
}
for (let i = 0; i < len; i += 1) {
  output[count[list[i]] - 1] = list[i];                 #place
  count[list[i]] -= 1;
}
for (let i = 0; i < len; i += 1) {
  list[i] = output[i];                                  #copy
}`,
  run(a) {
    const T = new Rec(a);
    const n = a.length;
    const range = Math.max(...a);
    const count = new Array(range + 1).fill(0);
    const out = new Array(n).fill(null);
    const aux = (cm = {}, om = {}) => [
      { label: 'count', cells: count.slice(), marks: cm, idx: true },
      { label: 'output', cells: out.slice(), marks: om, idx: true },
    ];
    T.snap('max', `Largest value is **${range}**, so count gets ${range + 1} slots`, { aux: aux() });
    for (let i = 0; i < n; i++) {
      count[a[i]]++;
      T.snap('tally', `a[${i}] = **${a[i]}** → count[${a[i]}] = ${count[a[i]]}`, { marks: { [i]: 'cmp' }, aux: aux({ [a[i]]: 'move' }), loop: `i = ${i}` });
    }
    for (let i = 1; i <= range; i++) {
      count[i] += count[i - 1];
      T.snap('prefix', `count[${i}] += count[${i - 1}] → **${count[i]}** values are ≤ ${i}`, { aux: aux({ [i]: 'move', [i - 1]: 'cmp' }), loop: `i = ${i}` });
    }
    for (let i = 0; i < n; i++) {
      const v = a[i];
      const pos = count[v] - 1;
      out[pos] = v;
      T.w++;
      count[v]--;
      T.snap('place', `a[${i}] = **${v}** goes to output[${pos}]; count[${v}] drops to ${count[v]}`, { marks: { [i]: 'cmp' }, aux: aux({ [v]: 'cmp' }, { [pos]: 'move' }), loop: `i = ${i}` });
    }
    for (let i = 0; i < n; i++) {
      a[i] = out[i];
      T.w++;
      T.done.add(i);
      T.snap('copy', `Copy output[${i}] = **${out[i]}** back to a[${i}]`, { marks: { [i]: 'move' }, aux: aux({}, { [i]: 'cmp' }), loop: `i = ${i}` });
    }
    return T.finish('copy');
  },
};

const heapSort = {
  id: 'heap-sort', name: 'Heap sort', kind: 'bars', bo: 'O(n log n)',
  chips: [['time', 'O(n log n)'], ['space', 'O(1) in place']],
  blurb: 'Arrange the array as a binary max-heap, where a[i] is at least as large as its children a[2i+1] and a[2i+2]. Then repeatedly swap the root to the end and sift the new root down.',
  legend: [['cmp', 'Comparing child'], ['move', 'Swapping'], ['pivot', 'Parent being sifted'], ['done', 'In final place']], stats: SORT_STATS,
  code: `
for (let i = (n >> 1) - 1; i >= 0; i -= 1) {
  siftDown(list, i, n);                                 #build
}
for (let end = n - 1; end > 0; end -= 1) {
  [list[0], list[end]] = [list[end], list[0]];          #extract
  siftDown(list, 0, end);
}
function siftDown(list, i, size) {
  let largest = i;
  const l = 2 * i + 1, r = 2 * i + 2;
  if (l < size && list[l] > list[largest]) largest = l; #cmpL
  if (r < size && list[r] > list[largest]) largest = r; #cmpR
  if (largest !== i) {
    [list[i], list[largest]] = [list[largest], list[i]]; #swap
    siftDown(list, largest, size);
  }
}`,
  run(a) {
    const T = new Rec(a);
    const n = a.length;
    const sift = (start, size) => {
      let i = start;
      for (;;) {
        let lg = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        const range = [0, size - 1];
        const loop = `i = ${i} · heap size = ${size}`;
        if (l < size) {
          T.c++;
          T.snap('cmpL', `Left child a[${l}] = **${a[l]}** vs parent a[${i}] = **${a[i]}**`, { range, marks: { [i]: 'pivot', [l]: 'cmp' }, loop });
          if (a[l] > a[lg]) lg = l;
        }
        if (r < size) {
          T.c++;
          T.snap('cmpR', `Right child a[${r}] = **${a[r]}** vs largest so far a[${lg}] = **${a[lg]}**`, { range, marks: { [i]: 'pivot', [r]: 'cmp', [lg]: lg === i ? 'pivot' : 'cmp' }, loop });
          if (a[r] > a[lg]) lg = r;
        }
        if (lg === i) break;
        [a[i], a[lg]] = [a[lg], a[i]];
        T.w += 2;
        T.snap('swap', `a[${lg}] is larger → swap it up; continue sifting at ${lg}`, { range, marks: { [i]: 'move', [lg]: 'move' }, loop });
        i = lg;
      }
    };
    for (let i = (n >> 1) - 1; i >= 0; i--) {
      T.snap('build', `Build heap: sift down from index ${i}`, { marks: { [i]: 'pivot' }, loop: `i = ${i}` });
      sift(i, n);
    }
    for (let end = n - 1; end > 0; end--) {
      [a[0], a[end]] = [a[end], a[0]];
      T.w += 2;
      T.done.add(end);
      T.snap('extract', `Move max **${a[end]}** from the root to index ${end}`, { range: [0, end - 1], marks: { 0: 'move', [end]: 'move' }, loop: `end = ${end}` });
      sift(0, end);
    }
    return T.finish('extract');
  },
};

const insertionSort = {
  id: 'insertion-sort', name: 'Insertion sort', kind: 'bars', bo: 'O(n²)',
  chips: [['time', 'O(n²)'], ['best', 'O(n)'], ['space', 'O(1)'], ['', 'stable']],
  blurb: 'Grow a sorted prefix one element at a time. Lift the next value as the key, shift every larger value one slot right, and drop the key into the gap.',
  legend: [['cmp', 'Comparing with key'], ['move', 'Shifting / inserting'], ['pivot', 'Key'], ['done', 'Sorted']], stats: SORT_STATS,
  code: `
for (let i = 1; i < len; i += 1) {
  let j = i - 1;
  const key = list[i];                                  #key
  while (j >= 0 && this._compareFunc(key, list[j])) {   #cmp
    list[j + 1] = list[j];                              #shift
    j -= 1;
  }
  list[j + 1] = key;                                    #insert
}
return list;                                            #ret`,
  run(a) {
    const T = new Rec(a);
    const n = a.length;
    for (let i = 1; i < n; i++) {
      const key = a[i];
      let j = i - 1;
      const aux = [{ label: 'key', cells: [key], marks: { 0: 'pivot' } }];
      const range = [0, i];
      T.snap('key', `Lift key = **${key}** from a[${i}]`, { marks: { [i]: 'pivot' }, range, aux, loop: `i = ${i}` });
      while (j >= 0) {
        T.c++;
        const go = key < a[j];
        T.snap('cmp', `Is key **${key}** < a[${j}] = **${a[j]}**? ${go ? 'yes' : 'no'}`, { marks: { [j]: 'cmp' }, range, aux, loop: `i = ${i} · j = ${j}` });
        if (!go) break;
        a[j + 1] = a[j];
        T.w++;
        T.snap('shift', `Shift ${a[j]} right into a[${j + 1}]`, { marks: { [j + 1]: 'move' }, range, aux, loop: `i = ${i} · j = ${j}` });
        j--;
      }
      a[j + 1] = key;
      T.w++;
      T.snap('insert', `Drop key **${key}** into a[${j + 1}]`, { marks: { [j + 1]: 'move' }, range, aux, loop: `i = ${i} · j = ${j}` });
    }
    return T.finish('ret');
  },
};

const mergeSort = {
  id: 'merge-sort', name: 'Merge sort', kind: 'bars', bo: 'O(n log n)',
  chips: [['time', 'O(n log n)'], ['space', 'O(n)'], ['', 'stable']],
  blurb: 'Split the array in half until each piece holds one value, then merge pieces back together. Each merge repeatedly takes the smaller front value of the left and right halves.',
  legend: [['cmp', 'Next slot to fill'], ['move', 'Written'], ['pivot', 'Split point'], ['done', 'Sorted']], stats: SORT_STATS,
  code: `
_mergeSort(list) {
  if (list.length > 1) {
    const middle = list.length >> 1;                    #split
    const leftList = this._mergeSort(list.slice(0, middle));
    const rightList = this._mergeSort(list.slice(middle));
    list = this._merge(leftList, rightList);            #merge
  }
  return list;
}
_merge(leftList, rightList) {
  while (i < leftList.length && j < rightList.length) {
    if (this._compareFunc(leftList[i], rightList[j])) { #cmp
      resultList.push(leftList[i]); i += 1;             #takeL
    } else {
      resultList.push(rightList[j]); j += 1;            #takeR
    }
  }
  return resultList.concat(leftovers);                  #rest
}`,
  run(a) {
    const T = new Rec(a);
    const ms = (lo, hi, depth) => {
      if (hi - lo <= 1) return;
      const mid = lo + ((hi - lo) >> 1);
      const range = [lo, hi - 1];
      T.snap('split', `Split a[${lo}…${hi - 1}] into [${lo}…${mid - 1}] and [${mid}…${hi - 1}]`, { range, marks: { [mid]: 'pivot' }, loop: `depth = ${depth}` });
      ms(lo, mid, depth + 1);
      ms(mid, hi, depth + 1);
      const L = a.slice(lo, mid);
      const R = a.slice(mid, hi);
      let i = 0;
      let j = 0;
      let k = lo;
      const aux = () => [
        { label: 'left', cells: L, marks: { [i]: 'cmp' }, used: i },
        { label: 'right', cells: R, marks: { [j]: 'cmp' }, used: j },
      ];
      const loop = () => `depth = ${depth} · i = ${i} · j = ${j} · k = ${k}`;
      T.snap('merge', `Merge left [${L.join(', ')}] with right [${R.join(', ')}]`, { range, aux: aux(), loop: loop() });
      while (i < L.length && j < R.length) {
        T.c++;
        const left = L[i] < R[j];
        T.snap('cmp', `Is left[${i}] = **${L[i]}** < right[${j}] = **${R[j]}**? ${left ? 'yes' : 'no'}`, { range, marks: { [k]: 'cmp' }, aux: aux(), loop: loop() });
        if (left) { a[k] = L[i]; i++; } else { a[k] = R[j]; j++; }
        T.w++;
        T.snap(left ? 'takeL' : 'takeR', `Write **${a[k]}** from ${left ? 'left' : 'right'} into a[${k}]`, { range, marks: { [k]: 'move' }, aux: aux(), loop: loop() });
        k++;
      }
      while (i < L.length || j < R.length) {
        const fromL = i < L.length;
        a[k] = fromL ? L[i++] : R[j++];
        T.w++;
        T.snap('rest', `Copy leftover **${a[k]}** from ${fromL ? 'left' : 'right'} into a[${k}]`, { range, marks: { [k]: 'move' }, aux: aux(), loop: loop() });
        k++;
      }
    };
    ms(0, a.length, 0);
    return T.finish('rest');
  },
};

const quickSort = {
  id: 'quick-sort', name: 'Quick sort', kind: 'bars', bo: 'O(n log n)',
  chips: [['time', 'O(n log n) avg'], ['worst', 'O(n²)'], ['space', 'O(log n)']],
  blurb: 'Lomuto partition: take the last element as pivot, sweep j across the range and swap every value ≤ pivot into the growing left side at i. The pivot then lands in its final place, and each side is sorted recursively.',
  legend: [['cmp', 'j, compared with pivot'], ['move', 'Swapping'], ['pivot', 'Pivot'], ['done', 'Final place']], stats: SORT_STATS,
  code: `
_partition(list, low, high) {
  const pivot = list[high];                             #pivot
  let i = (low - 1);
  for (let j = low; j <= high - 1; j += 1) {
    if (this._compareFunc(list[j], pivot)) {            #cmp
      i += 1;
      [list[i], list[j]] = [list[j], list[i]];          #swap
    }
  }
  [list[i + 1], list[high]] = [list[high], list[i + 1]]; #place
  return [list, i + 1];
}
_quickSort(list, low, high) {
  if (low < high) {
    const [sortedlist, pi] = this._partition(list, low, high);
    this._quickSort(sortedlist, low, pi - 1);
    this._quickSort(sortedlist, pi + 1, high);
  }
}`,
  run(a) {
    const T = new Rec(a);
    const qs = (lo, hi) => {
      if (lo > hi) return;
      if (lo === hi) { T.done.add(lo); return; }
      const p = a[hi];
      let i = lo - 1;
      const range = [lo, hi];
      T.snap('pivot', `Partition a[${lo}…${hi}] around pivot a[${hi}] = **${p}**`, { range, marks: { [hi]: 'pivot' }, loop: `low = ${lo} · high = ${hi}` });
      for (let j = lo; j < hi; j++) {
        T.c++;
        const le = a[j] <= p;
        T.snap('cmp', `Is a[${j}] = **${a[j]}** ≤ pivot ${p}? ${le ? 'yes' : 'no'}`, { range, marks: { [hi]: 'pivot', [j]: 'cmp' }, loop: `i = ${i} · j = ${j}` });
        if (le) {
          i++;
          [a[i], a[j]] = [a[j], a[i]];
          if (i !== j) T.w += 2;
          T.snap('swap', i === j ? `i = ${i}: already in place` : `i = ${i}: swap a[${i}] and a[${j}]`, { range, marks: { [hi]: 'pivot', [i]: 'move', [j]: 'move' }, loop: `i = ${i} · j = ${j}` });
        }
      }
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
      T.w += 2;
      T.done.add(i + 1);
      T.snap('place', `Pivot **${p}** belongs at index ${i + 1}: everything left is ≤, right is >`, { range, marks: { [i + 1]: 'done', [hi]: 'move' }, loop: `pi = ${i + 1}` });
      qs(lo, i);
      qs(i + 2, hi);
    };
    qs(0, a.length - 1);
    return T.finish('place');
  },
};

const selectionSort = {
  id: 'selection-sort', name: 'Selection sort', kind: 'bars', bo: 'O(n²)',
  chips: [['time', 'O(n²) always'], ['space', 'O(1)']],
  blurb: 'Scan the unsorted part for its minimum, then swap that minimum to the front. The sorted prefix grows by exactly one element per pass.',
  legend: [['cmp', 'Scanning'], ['move', 'Swapping'], ['pivot', 'Current minimum'], ['done', 'In final place']], stats: SORT_STATS,
  code: `
for (let i = 0; i < len - 1; i += 1) {
  let minIndex = i;                                     #start
  for (let j = i + 1; j < len; j += 1) {
    if (this._compareFunc(list[j], list[minIndex])) {   #cmp
      minIndex = j;                                     #min
    }
  }
  [list[i], list[minIndex]] = [list[minIndex], list[i]]; #swap
}
return list;                                            #ret`,
  run(a) {
    const T = new Rec(a);
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      const range = [i, n - 1];
      T.snap('start', `Pass ${i + 1}: assume a[${i}] = **${a[i]}** is the minimum`, { range, marks: { [i]: 'pivot' }, loop: `i = ${i}` });
      for (let j = i + 1; j < n; j++) {
        T.c++;
        const less = a[j] < a[m];
        T.snap('cmp', `Is a[${j}] = **${a[j]}** < min **${a[m]}**? ${less ? 'yes' : 'no'}`, { range, marks: { [m]: 'pivot', [j]: 'cmp' }, loop: `i = ${i} · j = ${j} · minIndex = ${m}` });
        if (less) {
          m = j;
          T.snap('min', `New minimum **${a[m]}** at index ${m}`, { range, marks: { [m]: 'pivot' }, loop: `i = ${i} · j = ${j} · minIndex = ${m}` });
        }
      }
      [a[i], a[m]] = [a[m], a[i]];
      if (i !== m) T.w += 2;
      T.done.add(i);
      T.snap('swap', i === m ? `a[${i}] is already the minimum` : `Swap minimum **${a[i]}** into index ${i}`, { range, marks: { [i]: 'move', [m]: 'move' }, loop: `i = ${i} · minIndex = ${m}` });
    }
    return T.finish('ret');
  },
};

export default [bubbleSort, countSort, heapSort, insertionSort, mergeSort, quickSort, selectionSort];
