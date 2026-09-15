import Msg from './Msg';

const VISIBLE = 7;

export default function StepLog({ frames, index }) {
  const from = Math.max(0, index - VISIBLE + 1);
  const recent = frames.slice(from, index + 1).map((f, k) => ({ step: from + k + 1, msg: f.msg })).reverse();
  return (
    <ol className="log">
      {recent.map(({ step, msg }) => (
        <li key={step}>
          <span>{step}</span>
          <div><Msg text={msg} /></div>
        </li>
      ))}
    </ol>
  );
}
