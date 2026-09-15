const thin = { vectorEffect: 'non-scaling-stroke' };

export default function GeoStage({ frame }) {
  const [[x1, y1, r1], [x2, y2, r2]] = frame.circles;
  const minX = Math.min(x1 - r1, x2 - r2);
  const maxX = Math.max(x1 + r1, x2 + r2);
  const minY = Math.min(y1 - r1, y2 - r2);
  const maxY = Math.max(y1 + r1, y2 + r2);
  const pad = Math.max(maxX - minX, maxY - minY) * 0.12 + 0.5;
  const left = minX - pad;
  const top = maxY + pad;
  const w = maxX - minX + 2 * pad;
  const h = maxY - minY + 2 * pad;
  const Y = (y) => top - y; // SVG y grows downward; maths y grows upward
  const u = Math.max(w, h) / 100; // one percent of the view, for dot and label sizes

  const gridX = [];
  for (let gx = Math.ceil(left); gx <= left + w; gx++) gridX.push(gx);
  const gridY = [];
  for (let gy = Math.ceil(top - h); gy <= top; gy++) gridY.push(gy);

  return (
    <svg className="geo-svg" viewBox={`${left} 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Two circles and their tangents">
      {gridX.map((gx) => (
        <line key={`x${gx}`} x1={gx} y1={0} x2={gx} y2={h} stroke="var(--line)" strokeWidth={gx === 0 ? 1.5 : 0.6} style={thin} />
      ))}
      {gridY.map((gy) => (
        <line key={`y${gy}`} x1={left} y1={Y(gy)} x2={left + w} y2={Y(gy)} stroke="var(--line)" strokeWidth={gy === 0 ? 1.5 : 0.6} style={thin} />
      ))}

      {frame.showDir && (
        <line x1={x1} y1={Y(y1)} x2={x2} y2={Y(y2)} stroke="var(--ink-3)" strokeDasharray="4 4" strokeWidth="1.5" style={thin} />
      )}

      {frame.circles.map(([cx, cy, r], k) => (
        <g key={k}>
          <circle cx={cx} cy={Y(cy)} r={r} fill="none" stroke="var(--ink)" strokeWidth="2" style={thin} />
          <circle cx={cx} cy={Y(cy)} r={u * 0.9} fill="var(--ink)" />
          <text x={cx + u * 1.5} y={Y(cy) - u * 1.5} fontSize={u * 3.4} fill="var(--ink-2)" fontFamily="JetBrains Mono, monospace">
            c{k + 1}
          </text>
        </g>
      ))}

      {frame.lines.map(({ pts: [ax, ay, bx, by], outer }, k) => {
        const color = outer ? 'var(--move)' : 'var(--pivot)';
        const newest = k === frame.lines.length - 1 && frame.line === 'push';
        return (
          <g key={k}>
            <line x1={ax} y1={Y(ay)} x2={bx} y2={Y(by)} stroke={color} strokeWidth={newest ? 3.5 : 2} style={thin} />
            <circle cx={ax} cy={Y(ay)} r={u * 0.8} fill={color} />
            <circle cx={bx} cy={Y(by)} r={u * 0.8} fill={color} />
          </g>
        );
      })}
    </svg>
  );
}
