// Code shown in the UI is what each run() below steps through.

const MAX_LEN = 14;

const levenshtein = {
  id: 'levenshtein', name: 'Levenshtein distance', kind: 'grid', bo: 'O(m·n)',
  chips: [['time', 'O(m · n)'], ['space', 'O(m · n)']],
  blurb: 'The fewest single-character inserts, deletes and substitutions that turn one string into the other. Cell dp[i][j] is the distance between the first i letters of b and the first j letters of a.',
  inputs: [['a', 'a', 'kitten', 'text'], ['b', 'b', 'sitting', 'text']],
  legend: [['move', 'Cell being filled'], ['cmp', 'Cells it reads'], ['done', 'Final answer']], stats: [['c', 'cells']],
  code: `
for (let i = 0; i <= b.length; i += 1) dp[i][0] = i;    #initRow
for (let i = 0; i <= a.length; i += 1) dp[0][i] = i;    #initCol
for (let i = 1; i <= b.length; i += 1) {
  for (let j = 1; j <= a.length; j += 1) {
    if (b.charAt(i - 1) === a.charAt(j - 1)) {
      dp[i][j] = dp[i - 1][j - 1];                      #match
    } else {
      dp[i][j] = Math.min(dp[i - 1][j - 1] + 1,
        Math.min(dp[i][j - 1] + 1, dp[i - 1][j] + 1));  #edit
    }
  }
}
return dp[b.length][a.length];                          #ret`,
  run(p) {
    const a = String(p.a ?? '').slice(0, MAX_LEN);
    const b = String(p.b ?? '').slice(0, MAX_LEN);
    const dp = [...Array(b.length + 1)].map(() => Array(a.length + 1).fill(null));
    const frames = [];
    let filled = 0;
    const snap = (line, msg, cur, src, extra = {}) => frames.push({
      a, b, dp: dp.map((r) => r.slice()), cur, src, line, msg, c: filled, loop: cur ? `i = ${cur[0]} · j = ${cur[1]}` : '', ...extra,
    });

    for (let i = 0; i <= b.length; i++) dp[i][0] = i;
    snap('initRow', "First column: turning b's first i letters into \"\" takes i deletes", null, []);
    for (let j = 0; j <= a.length; j++) dp[0][j] = j;
    snap('initCol', "First row: building a's first j letters from \"\" takes j inserts", null, []);

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        filled++;
        if (b[i - 1] === a[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
          snap('match', `'${b[i - 1]}' = '${a[j - 1]}' → copy the diagonal: **${dp[i][j]}**`, [i, j], [[i - 1, j - 1]]);
        } else {
          const diag = dp[i - 1][j - 1];
          const left = dp[i][j - 1];
          const up = dp[i - 1][j];
          dp[i][j] = Math.min(diag + 1, Math.min(left + 1, up + 1));
          snap('edit', `'${b[i - 1]}' ≠ '${a[j - 1]}' → 1 + min(replace ${diag}, insert ${left}, delete ${up}) = **${dp[i][j]}**`, [i, j], [[i - 1, j - 1], [i, j - 1], [i - 1, j]]);
        }
      }
    }
    snap('ret', `Distance from "${a}" to "${b}" is **${dp[b.length][a.length]}**`, null, [], { final: true });
    return frames;
  },
};

export default [levenshtein];
