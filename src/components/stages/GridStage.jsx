// Levenshtein DP table: a across the top, b down the side.
export default function GridStage({ frame }) {
  const { a, b, dp, cur, src = [], final } = frame;
  const reads = new Set(src.map(([i, j]) => `${i},${j}`));

  const cellClass = (i, j) => {
    const isCur = cur && cur[0] === i && cur[1] === j;
    const isAnswer = final && i === b.length && j === a.length;
    if (isCur || isAnswer) return 'cur';
    if (reads.has(`${i},${j}`)) return 'src';
    return dp[i][j] === null ? 'empty' : '';
  };

  return (
    <>
      <div className="note mono">a = "{a}" across · b = "{b}" down</div>
      <div className="grid-wrap">
        <table className="dp">
          <tbody>
            <tr>
              <th />
              <th>ε</th>
              {[...a].map((ch, j) => <th key={j} className={cur?.[1] === j + 1 ? 'hl' : ''}>{ch}</th>)}
            </tr>
            {dp.map((row, i) => (
              <tr key={i}>
                <th className={cur?.[0] === i ? 'hl' : ''}>{i === 0 ? 'ε' : b[i - 1]}</th>
                {row.map((v, j) => <td key={j} className={cellClass(i, j)}>{v === null ? '·' : v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
