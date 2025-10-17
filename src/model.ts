// src/model.ts
// Представление:
// - Пробирка (Tube) — массив длины V: индекс 0 = дно, V-1 = верх.
// - Ячейка: number | string | null (null = пусто).

export type Cell = number | string | null;
export type Tube = Cell[];
export type Board = Tube[];
export type Move = { from: number; to: number };

type Color = Exclude<Cell, null>;

export function capacity(board: Board): number {
  if (board.length === 0) return 0;
  return board[0].length;
}

// Вход даётся "сверху-вниз"; переводим во внутренний вид "дно-верх".
export function parseBoardFromTopMatrix(matrix: Cell[][]): Board {
  const V = matrix[0]?.length ?? 0;
  return matrix.map(tubeTopDown => {
    if (tubeTopDown.length !== V) throw new Error("All tubes must have equal height V");
    const t: Tube = new Array(V);
    for (let j = 0; j < V; j++) {
      t[V - 1 - j] = tubeTopDown[j] ?? null;
    }
    return t;
  });
}

// Обратное преобразование: "дно-верх" → "верх-вниз".
export function toTopMatrix(board: Board): Cell[][] {
  const V = capacity(board);
  return board.map(t => {
    const topDown: Cell[] = new Array(V);
    for (let j = 0; j < V; j++) topDown[j] = t[V - 1 - j] ?? null;
    return topDown;
  });
}

export function cloneBoard(board: Board): Board {
  return board.map(t => t.slice());
}

// Индекс верхней непустой ячейки, или -1.
export function topIndex(t: Tube): number {
  for (let i = t.length - 1; i >= 0; i--) if (t[i] !== null) return i;
  return -1;
}

// Верхняя серия: цвет и её длина; null, если пробирка пустая.
export function topRun(t: Tube): { color: Color; len: number } | null {
  const ti = topIndex(t);
  if (ti === -1) return null;
  const color = t[ti] as Color;
  let k = 1;
  for (let i = ti - 1; i >= 0 && t[i] === color; i--) k++;
  return { color, len: k };
}

export function freeSpace(t: Tube): number {
  let k = 0;
  for (let i = 0; i < t.length; i++) if (t[i] === null) k++;
  return k;
}

// Ход A→B разрешён, если: в A есть верхняя серия; в B есть место;
// и при этом B либо пустая, либо сверху тот же цвет.
export function canPour(from: Tube, to: Tube): boolean {
  const run = topRun(from);
  if (!run) return false;
  if (freeSpace(to) === 0) return false;
  const ti = topIndex(to);
  if (ti === -1) return true;
  return to[ti] === run.color;
}

// Переливаем min(длина верхней серии A, свободное место B). Иммутабельно.
// Перед выкладкой уплотняем B, чтобы не было "дыр".
export function applyMove(board: Board, mv: Move): Board {
  const b = cloneBoard(board);
  const V = capacity(b);
  const A = b[mv.from];
  const B = b[mv.to];
  if (!A || !B) throw new Error("Invalid tube index");
  if (!canPour(A, B)) return b;

  const { color, len } = topRun(A)!;
  const k = Math.min(len, freeSpace(B));

  // снять k капель с вершины A
  for (let i = V - 1, left = k; i >= 0 && left > 0; i--) {
    if (A[i] !== null) {
      A[i] = null;
      left--;
    }
  }

  // уплотнить B и положить k капель сверху
  compactTube(B);
  for (let i = V - 1, placed = 0; i >= 0 && placed < k; i--) {
    if (B[i] === null) {
      B[i] = color;
      placed++;
    }
  }

  return b;
}

// Уплотнение пробирки: все непустые к верху, пустые вниз.
export function compactTube(t: Tube): void {
  const V = t.length;
  let write = V - 1;
  for (let i = V - 1; i >= 0; i--) {
    if (t[i] !== null) {
      const v = t[i];
      t[i] = null;
      t[write] = v;
      write--;
    }
  }
}

export function legalMoves(board: Board): Move[] {
  const moves: Move[] = [];
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (i !== j && canPour(board[i], board[j])) moves.push({ from: i, to: j });
    }
  }
  return moves;
}

// Отсортировано: каждая пробирка либо пустая, либо состоит из одного цвета и без "дыр".
export function isSolved(board: Board): boolean {
  for (const t of board) {
    let color: Color | null = null;
    let seenNonNull = false;

    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (c === null) {
        if (seenNonNull) return false; // null над цветом ⇒ "дыра"
      } else {
        if (color === null) color = c as Color;
        else if (c !== color) return false;
        seenNonNull = true;
      }
    }
  }
  return true;
}
