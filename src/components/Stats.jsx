export default function Stats({ algo, player }) {
  const { frame, index, total } = player;
  const items = [
    ...algo.stats.map(([key, label]) => [label, frame[key] ?? 0]),
    ['step', index + 1],
    ['of', total],
  ].slice(0, 3);

  return (
    <dl className="stats">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
