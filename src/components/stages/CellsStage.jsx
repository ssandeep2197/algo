import { markOf } from './marks';

export default function CellsStage({ frame, target }) {
  return (
    <div className="search-stage">
      <div className="target">
        target <b>{target}</b>
        {frame.found !== undefined && <> · returns <b>{frame.found}</b></>}
      </div>
      <div className="scells">
        {frame.arr.map((value, i) => (
          <div key={i} className={`c ${markOf(frame, i)}`}>
            {value}
            <small>{i}</small>
            <em>{frame.tags?.[i] || ''}</em>
          </div>
        ))}
      </div>
    </div>
  );
}
