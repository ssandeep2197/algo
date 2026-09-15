// Renders a step message, turning **value** into bold text.
export default function Msg({ text }) {
  if (!text) return null;
  return String(text).split('**').map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part));
}
