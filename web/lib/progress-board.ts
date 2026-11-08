// Where each lesson sits on the hero's "memory ladder". A lesson with no solved steps is on the disk, far from the
// processor. The more of its steps you solve, the closer it moves, until it reaches the registers.
export const LEVELS = [
  { name: "Registers", cost: "about 1 cycle" },
  { name: "Cache", cost: "about 4 cycles" },
  { name: "Main memory", cost: "about 200 cycles" },
  { name: "Disk", cost: "300,000 cycles or more" },
] as const;

export const COLS = 12; // blocks per row
export const SLOT = 1.25; // one block plus its gap, in units
export const CHIP = 2.5; // height of the processor drawing, in units
const LABEL = 1; // height of a level's name line, in units
// Extra empty space above each level. It grows with the real distance, so the disk feels far away.
const GAP = [0.75, 1.5, 2.5, 4.5];

export type Level = 0 | 1 | 2 | 3;

export function levelOf(done: number, total: number): Level {
  if (total === 0 || done === 0) return 3;
  const fraction = done / total;
  if (fraction >= 1) return 0;
  return fraction >= 0.5 ? 1 : 2;
}

export type Placement = { x: number; y: number };

// Positions, in units, for every lesson, plus the top of each level's band and the full height.
export function layoutBoard(levels: Level[]) {
  const counts = [0, 0, 0, 0];
  levels.forEach((level) => counts[level]++);
  const tops: number[] = [];
  let cursor = CHIP;
  for (let level = 0; level < 4; level++) {
    cursor += GAP[level];
    tops.push(cursor);
    cursor += LABEL + Math.max(1, Math.ceil(counts[level] / COLS)) * SLOT;
  }
  const seen = [0, 0, 0, 0];
  const places: Placement[] = levels.map((level) => {
    const k = seen[level]++;
    return { x: (k % COLS) * SLOT, y: tops[level] + LABEL + Math.floor(k / COLS) * SLOT };
  });
  return { places, tops, height: cursor };
}
