export default function Header({ algo }) {
  return (
    <header className="head">
      <div className="path">
        src/algorithms/<b>{algo.group}.js</b>
      </div>
      <h1>{algo.name}</h1>
      <p className="blurb">
        {algo.blurb}
        {algo.note && (
          <>
            <br />
            <span className="note">{algo.note}</span>
          </>
        )}
      </p>
      <div className="chips">
        {algo.chips.map(([label, value]) => (
          <span className="chip" key={label + value}>
            {label && <i>{label}</i>}
            {value}
          </span>
        ))}
      </div>
    </header>
  );
}
