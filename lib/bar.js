import { fg, blink, noColor } from "./colors.js";

const FILLED = "█";
const EMPTY = "░";

export function colorForUsed(usedPct) {
  if (usedPct >= 80) return (s) => blink(fg.red(s));
  if (usedPct >= 65) return fg.orange;
  if (usedPct >= 50) return fg.yellow;
  return fg.green;
}

export function renderBar(usedPct, width = 10) {
  const clamped = Math.max(0, Math.min(100, usedPct));
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;
  const body = FILLED.repeat(filled) + EMPTY.repeat(empty);
  if (noColor()) return `[${body}] ${clamped.toFixed(0)}%`;
  const paint = colorForUsed(clamped);
  return `${paint(body)} ${paint(`${clamped.toFixed(0)}%`)}`;
}
