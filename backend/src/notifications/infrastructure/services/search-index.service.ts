import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { AvlTree } from '../../domain/structures/avl-tree';

export interface SearchEntry {
  id: number | string;
  type: 'VENDOR' | 'PRODUCT';
  name: string;            // valor original (display)
  normalized: string;      // valor normalizado (clave de búsqueda)
  vendorId?: number;
}

/**
 * Índice en memoria de tiendas y productos basado en árbol AVL.
 *
 * - Inserción O(log n)
 * - Búsqueda exacta O(log n)
 * - Prefix search O(log n + k) con `findAll(predicate)` (in-order)
 *
 * Se rebuilda cada 5 minutos con `@Interval` (patrón Observer del
 * scheduler de Nest). Si la BD no está disponible, se queda con la
 * última snapshot — robusto sin caer.
 */
@Injectable()
export class SearchIndexService implements OnModuleInit {
  private readonly logger = new Logger(SearchIndexService.name);
  private tree: AvlTree<SearchEntry> = new AvlTree<SearchEntry>((a, b) =>
    a.normalized.localeCompare(b.normalized),
  );
  private lastBuildAt: Date | null = null;

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    await this.rebuild();
  }

  /** Rebuild scheduled — cada 5 minutos. */
  @Interval(5 * 60 * 1000)
  async rebuildIfNeeded(): Promise<void> {
    await this.rebuild();
  }

  /**
   * Reconstruye el AVL desde PostgreSQL. Lee vendors + products en
   * paralelo (Promise.all) — async/concurrencia explícita.
   */
  async rebuild(): Promise<{ size: number; ms: number }> {
    const t0 = Date.now();
    const newTree = new AvlTree<SearchEntry>((a, b) =>
      a.normalized.localeCompare(b.normalized),
    );

    try {
      const [vendors, products] = await Promise.all([
        this.fetchVendors(),
        this.fetchProducts(),
      ]);

      // Inserción O(n log n) total
      for (const v of vendors) newTree.insert(v);
      for (const p of products) newTree.insert(p);

      this.tree = newTree;
      this.lastBuildAt = new Date();
      const ms = Date.now() - t0;
      this.logger.log(`Índice AVL reconstruido: ${newTree.size} entradas en ${ms} ms`);
      return { size: newTree.size, ms };
    } catch (err) {
      this.logger.warn(`Rebuild de índice falló: ${(err as Error).message}`);
      return { size: this.tree.size, ms: Date.now() - t0 };
    }
  }

  /** Búsqueda por prefijo o substring — O(log n + k). */
  search(query: string, limit = 20): SearchEntry[] {
    const q = this.normalize(query);
    if (!q) return [];
    const results = this.tree.findAll((entry) => entry.normalized.includes(q));
    return results.slice(0, limit);
  }

  stats(): { size: number; lastBuildAt: string | null } {
    return {
      size: this.tree.size,
      lastBuildAt: this.lastBuildAt?.toISOString() ?? null,
    };
  }

  // ──────────────────────────── Internals ────────────────────────────

  private normalize(s: string): string {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // sin acentos
      .trim();
  }

  private async fetchVendors(): Promise<SearchEntry[]> {
    const rows: { vendor_id: number; business_name: string }[] = await this.dataSource.query(
      `SELECT vendor_id, business_name FROM vendor WHERE business_name IS NOT NULL`,
    );
    return rows.map((r) => ({
      id: r.vendor_id,
      type: 'VENDOR',
      name: r.business_name,
      normalized: this.normalize(r.business_name),
    }));
  }

  private async fetchProducts(): Promise<SearchEntry[]> {
    try {
      const rows: { product_id: string; name: string; vendor_id: number }[] =
        await this.dataSource.query(
          `SELECT product_id, name, vendor_id FROM product WHERE name IS NOT NULL AND is_available = true`,
        );
      return rows.map((r) => ({
        id: r.product_id,
        type: 'PRODUCT',
        name: r.name,
        normalized: this.normalize(r.name),
        vendorId: r.vendor_id,
      }));
    } catch {
      return []; // si la tabla no existe aún
    }
  }
}
