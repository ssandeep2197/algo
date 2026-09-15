export default function Sidebar({ groups, currentId, onSelect }) {
  return (
    <aside className="index">
      <div className="brand">
        <b>algorithms-js</b>
        <span>step through, one loop at a time</span>
      </div>
      <nav aria-label="Algorithms">
        {groups.map(({ name, algos }) => (
          <div className="group" key={name}>
            <h2>
              <span>{name}/</span>
              <span>{algos.length}</span>
            </h2>
            <ul>
              {algos.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className="algo-btn"
                    aria-current={a.id === currentId}
                    onClick={() => onSelect(a.id)}
                  >
                    <span className="nm">{a.name}</span>
                    <span className="bo">{a.bo}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
