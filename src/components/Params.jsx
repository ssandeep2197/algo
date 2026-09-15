import { useState } from 'react';
import { PRESETS, makeSearchData, pickPresent, pickMissing } from '../data';

function SortParams({ sort, onChange }) {
  return (
    <>
      <label className="field" htmlFor="p-size">
        Values
        <input
          type="range" id="p-size" min="8" max="64" value={sort.size}
          onChange={(e) => onChange({ size: Number(e.target.value), preset: sort.preset })}
        />
        <span className="counter">{sort.size}</span>
      </label>
      <label className="field" htmlFor="p-preset">
        Start from
        <select id="p-preset" value={sort.preset} onChange={(e) => onChange({ size: sort.size, preset: e.target.value })}>
          {PRESETS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <button type="button" className="pbtn" onClick={() => onChange({ size: sort.size, preset: sort.preset })}>
        New random data
      </button>
      <span className="note">Every sort shares this data, so you can compare them.</span>
    </>
  );
}

function SearchParams({ search, onChange }) {
  const [draft, setDraft] = useState(String(search.target));
  const [synced, setSynced] = useState(search.target);
  if (synced !== search.target) {
    setSynced(search.target);
    setDraft(String(search.target));
  }
  const commit = () => {
    const v = parseInt(draft, 10);
    if (Number.isFinite(v) && v !== search.target) onChange({ ...search, target: v });
    else setDraft(String(search.target));
  };
  return (
    <>
      <label className="field" htmlFor="p-ssize">
        Values
        <input
          type="range" id="p-ssize" min="8" max="64" value={search.size}
          onChange={(e) => onChange(makeSearchData(Number(e.target.value)))}
        />
        <span className="counter">{search.size}</span>
      </label>
      <label className="field" htmlFor="p-target">
        Target
        <input
          type="number" id="p-target" value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
        />
      </label>
      <button type="button" className="pbtn" onClick={() => onChange({ ...search, target: pickPresent(search.data) })}>
        Pick a value that exists
      </button>
      <button type="button" className="pbtn" onClick={() => onChange({ ...search, target: pickMissing(search.data) })}>
        Pick a missing value
      </button>
      <button type="button" className="pbtn" onClick={() => onChange(makeSearchData(search.size))}>
        New array
      </button>
    </>
  );
}

// Edits are kept as a draft and applied on Enter, blur, or Run.
function InputParams({ algo, values, onChange }) {
  const [draft, setDraft] = useState(values);
  const commit = () => {
    if (algo.inputs.some(([key]) => String(draft[key]) !== String(values[key]))) onChange({ ...draft });
  };
  return (
    <form
      className="params-form"
      onSubmit={(e) => { e.preventDefault(); onChange({ ...draft }); }}
    >
      {algo.inputs.map(([key, label, , type]) => (
        <label className="field" htmlFor={`in-${algo.id}-${key}`} key={key}>
          {label}
          <input
            id={`in-${algo.id}-${key}`}
            type={type || 'number'}
            step={type ? undefined : 'any'}
            maxLength={type === 'text' ? 14 : undefined}
            value={draft[key]}
            onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
            onBlur={commit}
          />
        </label>
      ))}
      <button type="submit" className="pbtn">Run</button>
    </form>
  );
}

export default function Params({ algo, sort, onSortChange, search, onSearchChange, values, onValuesChange }) {
  let body;
  if (algo.kind === 'bars') body = <SortParams sort={sort} onChange={onSortChange} />;
  else if (algo.kind === 'cells') body = <SearchParams search={search} onChange={onSearchChange} />;
  else if (algo.inputs) body = <InputParams key={algo.id} algo={algo} values={values} onChange={onValuesChange} />;
  else {
    body = (
      <span className="note">
        Fixed 12-node tree, children listed left to right. Switch between BFS and DFS to compare the visit order.
      </span>
    );
  }
  return <div className="params">{body}</div>;
}
