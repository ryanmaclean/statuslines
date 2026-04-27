const ESC = "[";
const wrap = (code) => (s) => `${ESC}${code}m${s}${ESC}0m`;

export const dim = wrap("2");
export const bold = wrap("1");
export const reset = `${ESC}0m`;

export const fg = {
  green: wrap("32"),
  yellow: wrap("33"),
  orange: wrap("38;5;208"),
  red: wrap("31"),
  blue: wrap("34"),
  cyan: wrap("36"),
  magenta: wrap("35"),
  gray: wrap("90"),
};

export const blink = wrap("5");

export function noColor() {
  return process.env.NO_COLOR != null || process.env.TERM === "dumb";
}
