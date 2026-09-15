// Small labelled rows of cells: merge halves, count arrays, the BFS queue, etc.
export default function AuxRows({ rows }) {
  if (!rows?.length) return null;
  return (
    <div className="aux-rows">
      {rows.map((row) => (
        <div className="aux" key={row.label}>
          <div className="aux-label">{row.label}</div>
          <div className="cells">
            {row.cells.map((value, i) => {
              let cls = row.marks?.[i] || '';
              if (!cls && row.used !== undefined && i < row.used) cls = 'used';
              return (
                <div className={`c ${cls}`} key={i}>
                  {value === null ? '·' : value}
                  {row.idx && <small>{i}</small>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
