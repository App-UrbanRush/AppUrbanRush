/**
 * Árbol AVL genérico — autobalanceado.
 *
 * Garantiza inserción / búsqueda / borrado en O(log n) incluso con datos
 * insertados en orden (cosa que un BST común degenera a O(n)).
 *
 * Uso en este proyecto: índice de tiendas y productos por nombre normalizado
 * para que la búsqueda en /search sea O(log n) sin pegarle a la BD.
 *
 * El comparador es externo, así que el mismo árbol sirve para strings,
 * números, fechas o estructuras complejas (composable).
 */

export interface AvlNode<T> {
  value: T;
  height: number;
  left: AvlNode<T> | null;
  right: AvlNode<T> | null;
}

export type Comparator<T> = (a: T, b: T) => number;

export class AvlTree<T> {
  private root: AvlNode<T> | null = null;
  private _size = 0;

  constructor(private readonly compare: Comparator<T>) {}

  get size(): number {
    return this._size;
  }

  // ─────────────────────────────── API ───────────────────────────────

  insert(value: T): void {
    this.root = this.insertNode(this.root, value);
  }

  remove(value: T): boolean {
    const before = this._size;
    this.root = this.removeNode(this.root, value);
    return this._size < before;
  }

  /** Búsqueda exacta — O(log n). */
  contains(value: T): boolean {
    let node = this.root;
    while (node !== null) {
      const cmp = this.compare(value, node.value);
      if (cmp === 0) return true;
      node = cmp < 0 ? node.left : node.right;
    }
    return false;
  }

  /**
   * Búsqueda por rango con predicado — útil para "todos los que empiezan con X".
   * Recorre en orden in-order, así que el resultado sale ordenado.
   */
  findAll(predicate: (value: T) => boolean): T[] {
    const out: T[] = [];
    this.traverseInOrder(this.root, (v) => {
      if (predicate(v)) out.push(v);
    });
    return out;
  }

  toSortedArray(): T[] {
    const out: T[] = [];
    this.traverseInOrder(this.root, (v) => out.push(v));
    return out;
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  // ──────────────────────────── Internals ────────────────────────────

  private insertNode(node: AvlNode<T> | null, value: T): AvlNode<T> {
    if (node === null) {
      this._size++;
      return { value, height: 1, left: null, right: null };
    }

    const cmp = this.compare(value, node.value);
    if (cmp < 0) node.left = this.insertNode(node.left, value);
    else if (cmp > 0) node.right = this.insertNode(node.right, value);
    else return node; // duplicado → ignorar

    return this.rebalance(node);
  }

  private removeNode(node: AvlNode<T> | null, value: T): AvlNode<T> | null {
    if (node === null) return null;

    const cmp = this.compare(value, node.value);
    if (cmp < 0) node.left = this.removeNode(node.left, value);
    else if (cmp > 0) node.right = this.removeNode(node.right, value);
    else {
      // encontrado
      this._size--;
      if (!node.left || !node.right) return node.left ?? node.right;

      // dos hijos: reemplazar por el sucesor in-order
      const succ = this.minNode(node.right);
      node.value = succ.value;
      this._size++; // compensar — el deleteNode siguiente va a decrementar
      node.right = this.removeNode(node.right, succ.value);
    }

    return this.rebalance(node);
  }

  private minNode(node: AvlNode<T>): AvlNode<T> {
    let cur = node;
    while (cur.left) cur = cur.left;
    return cur;
  }

  private height(node: AvlNode<T> | null): number {
    return node?.height ?? 0;
  }

  private balanceFactor(node: AvlNode<T>): number {
    return this.height(node.left) - this.height(node.right);
  }

  private updateHeight(node: AvlNode<T>): void {
    node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
  }

  private rotateRight(y: AvlNode<T>): AvlNode<T> {
    const x = y.left!;
    y.left = x.right;
    x.right = y;
    this.updateHeight(y);
    this.updateHeight(x);
    return x;
  }

  private rotateLeft(x: AvlNode<T>): AvlNode<T> {
    const y = x.right!;
    x.right = y.left;
    y.left = x;
    this.updateHeight(x);
    this.updateHeight(y);
    return y;
  }

  private rebalance(node: AvlNode<T>): AvlNode<T> {
    this.updateHeight(node);
    const bf = this.balanceFactor(node);

    // Caso LL
    if (bf > 1 && this.balanceFactor(node.left!) >= 0) return this.rotateRight(node);
    // Caso LR
    if (bf > 1 && this.balanceFactor(node.left!) < 0) {
      node.left = this.rotateLeft(node.left!);
      return this.rotateRight(node);
    }
    // Caso RR
    if (bf < -1 && this.balanceFactor(node.right!) <= 0) return this.rotateLeft(node);
    // Caso RL
    if (bf < -1 && this.balanceFactor(node.right!) > 0) {
      node.right = this.rotateRight(node.right!);
      return this.rotateLeft(node);
    }

    return node;
  }

  private traverseInOrder(node: AvlNode<T> | null, visit: (v: T) => void): void {
    if (!node) return;
    this.traverseInOrder(node.left, visit);
    visit(node.value);
    this.traverseInOrder(node.right, visit);
  }
}
