const TOKENS = /(\/\/.*$)|\b(const|let|for|while|if|else|return|function|new|break|continue)\b|\b(\d+(?:\.\d+)?)\b/g;

// Minimal highlighting: keywords, numbers, and line comments.
function highlight(text) {
  const out = [];
  let last = 0;
  text.replace(TOKENS, (match, comment, keyword, number, offset) => {
    if (offset > last) out.push(text.slice(last, offset));
    let cls = 'num';
    if (comment) cls = 'cm';
    else if (keyword) cls = 'kw';
    out.push(<span key={offset} className={cls}>{match}</span>);
    last = offset + match.length;
    return match;
  });
  if (last < text.length) out.push(text.slice(last));
  return out.length ? out : ' ';
}

export default function CodePane({ lines, activeTag }) {
  return (
    <ol className="code">
      {lines.map((line, i) => (
        <li key={i} className={activeTag && line.tag === activeTag ? 'on' : ''}>
          {highlight(line.text)}
        </li>
      ))}
    </ol>
  );
}
