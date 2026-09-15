// Which colour class an array index gets in a frame. Explicit marks win,
// then found/sorted state, then dimming for indices outside the active range.
export const markOf = (frame, i) => {
  if (frame.marks?.[i]) return frame.marks[i];
  if (frame.found === i) return 'done';
  if (frame.done?.includes(i)) return 'done';
  if (frame.range && (i < frame.range[0] || i > frame.range[1])) return 'out';
  return '';
};
