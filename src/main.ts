// src/main.ts
import {
  parseBoardFromTopMatrix,
  legalMoves,
  applyMove,
  isSolved,
} from "./model.js";
import { draw as drawBoard } from "./print.js";

// Демо: N=4, V=4 (две пустые пробирки), вход задан сверху-вниз; null = пусто
const startTopMatrix = [
  [1, 2, 1, 2],
  [2, 1, 2, 1],
  [null, null, null, null],
  [null, null, null, null],
];

const board = parseBoardFromTopMatrix(startTopMatrix);

console.log("Старт:");
console.log(drawBoard(board));

const moves = legalMoves(board);
console.log(
  "\nЛегальные ходы (from->to):",
  moves.map(m => `${m.from}->${m.to}`).join(", ")
);

// Один ход для демонстрации
if (moves.length > 0) {
  const next = applyMove(board, moves[0]);
  console.log("\nПосле хода", `${moves[0].from}->${moves[0].to}`);
  console.log(drawBoard(next));
  console.log("\nОтсортировано?", isSolved(next));
}
