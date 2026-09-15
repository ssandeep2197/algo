import { TREE } from '../../algorithms';
import AuxRows from './AuxRows';

const W = 640;
const H = 290;
const LEVEL = 76;

// Leaves are spaced evenly; each parent sits centred over its children.
const POS = (() => {
  const pos = {};
  const leafCount = Object.values(TREE).filter((c) => !c.length).length;
  let leaf = 0;
  const place = (node, depth) => {
    const children = TREE[node];
    const y = 30 + depth * LEVEL;
    if (!children.length) {
      pos[node] = [((leaf++ + 0.5) / leafCount) * W, y];
      return;
    }
    children.forEach((c) => place(c, depth + 1));
    pos[node] = [children.reduce((s, c) => s + pos[c][0], 0) / children.length, y];
  };
  place('A', 0);
  return pos;
})();

const EDGES = Object.entries(TREE).flatMap(([parent, children]) => children.map((child) => [parent, child]));

export default function TreeStage({ frame, structure }) {
  const visited = new Set(frame.visited);
  const waiting = new Set(frame.box);
  const isQueue = structure === 'queue';
  const nextOut = isQueue ? 0 : frame.box.length - 1;

  return (
    <>
      <svg className="tree-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Tree being traversed">
        {EDGES.map(([p, c]) => (
          <line
            key={p + c}
            className={`edge ${visited.has(p) && visited.has(c) ? 'done' : ''}`}
            x1={POS[p][0]} y1={POS[p][1]} x2={POS[c][0]} y2={POS[c][1]}
          />
        ))}
        {Object.keys(TREE).map((node) => {
          let cls = '';
          if (frame.cur === node) cls = 'move';
          else if (visited.has(node)) cls = 'done';
          else if (waiting.has(node)) cls = 'cmp';
          return (
            <g key={node} className={cls}>
              <circle cx={POS[node][0]} cy={POS[node][1]} r="18" />
              <text x={POS[node][0]} y={POS[node][1]}>{node}</text>
            </g>
          );
        })}
      </svg>
      <AuxRows
        rows={[
          { label: structure, cells: frame.box.length ? frame.box : ['empty'], marks: frame.box.length ? { [nextOut]: 'cmp' } : {} },
          { label: 'visited', cells: frame.visited.length ? frame.visited : ['none'] },
        ]}
      />
      <div className="note">
        {isQueue ? 'Queue: next out is the left-most item.' : 'Stack: next out is the right-most item.'}
      </div>
    </>
  );
}
