import AuxRows from './AuxRows';
import { markOf } from './marks';

export default function BarsStage({ frame, max }) {
  const n = frame.arr.length;
  const showLabels = n <= 24;
  return (
    <>
      <div className="bars" style={{ '--gap': `${n > 40 ? 1 : 2}px` }}>
        {frame.arr.map((value, i) => (
          <div key={i} className={`bar ${markOf(frame, i)}`} style={{ '--h': value / max }}>
            {showLabels && <span>{value}</span>}
          </div>
        ))}
      </div>
      <AuxRows rows={frame.aux} />
    </>
  );
}
