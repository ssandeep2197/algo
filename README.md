# algorithms-js

A React app for watching algorithms run one step at a time. Pick an algorithm on the left; the right side shows each loop iteration, the line of code being run, and counters for comparisons and writes.

## Run it

```shell
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Algorithms

| Group    | Algorithms |
|----------|------------|
| sort     | Bubble, Count, Heap, Insertion, Merge, Quick, Selection |
| search   | Linear, Binary, Jump, Interpolation, Exponential, Ternary, BFS, DFS |
| math     | GCD, LCM, Extended Euclidean, Fast exponentiation, Modular inverse |
| string   | Levenshtein distance |
| geometry | Tangents between two circles |

## Project layout

```
src/
  algorithms/     one module: import { ALGOS, GROUPS, byId } from './algorithms'
    index.js      entry point
    sort.js  search.js  math.js  string.js  geometry.js
    recorder.js   helpers that record a frame per step
  components/     Sidebar, Header, Params, Stage, Transport, CodePane, Stats, StepLog
    stages/       one view per kind: bars, cells, tree, table, grid, geometry
  hooks/usePlayer.js   play / pause / step / speed
  data.js         sample data for sorts and searches
  App.jsx
```

To add an algorithm, add an object with `id`, `name`, `kind`, `code` and `run(input)` to the matching file in `src/algorithms/`. `run` returns a list of frames and the app renders them.

## License

MIT. See [LICENSE](LICENSE). Based on [algorithms-js](https://github.com/manrajgrover/algorithms-js) by Manraj Singh.
