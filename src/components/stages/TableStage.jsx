import { useEffect, useRef } from 'react';

export default function TableStage({ frame, finalResult }) {
  const wrapRef = useRef(null);
  const hiRef = useRef(null);

  // Keep the newest row in view as the table grows.
  useEffect(() => {
    const wrap = wrapRef.current;
    const row = hiRef.current;
    if (wrap && row) wrap.scrollTop = Math.max(0, row.offsetTop - wrap.clientHeight + row.offsetHeight * 2);
  }, [frame]);

  return (
    <div className="table-stage">
      {frame.result
        ? <div className="result">{frame.result}</div>
        : <div className="result pending">{finalResult}<small>when finished</small></div>}
      <div className="tbl-wrap" ref={wrapRef}>
        <table>
          <thead>
            <tr>{frame.cols.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {frame.rows.map((row, i) => (
              <tr key={i} className={i === frame.hi ? 'hi' : ''} ref={i === frame.hi ? hiRef : undefined}>
                {row.map((v, j) => <td key={j}>{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
