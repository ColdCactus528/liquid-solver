// src/print.ts
import type { Board, Cell } from "./model.js";

export function draw(board: Board): string {
  const V = board[0]?.length ?? 0;
  const N = board.length;

  const fmt = (c: Cell) =>
    c === null ? "·" : String(c).length === 1 ? String(c) : String(c).slice(0, 1);

  const lines: string[] = [];
  for (let h = V - 1; h >= 0; h--) {
    const row = board.map(t => ` ${fmt(t[h])} `).join("|");
    lines.push("|" + row + "|");
  }
  // индексы пробирок
  const idx = Array.from({ length: N }, (_, i) => i.toString().padStart(2, " ")).join("  ");
  lines.push(" " + idx);

  return lines.join("\n");
}
