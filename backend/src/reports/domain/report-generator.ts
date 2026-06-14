/**
 * Template Method — define el esqueleto del algoritmo de generación de
 * reportes y deja la lógica variable (formato, serialización) a las
 * subclases concretas (PdfReportGenerator, ExcelReportGenerator).
 *
 * Flujo fijo:
 *   1. validate()
 *   2. loadData()           ← variable: la define la subclase específica
 *   3. transform(data)      ← hook opcional con default
 *   4. format(data)         ← variable: la define la subclase
 *   5. afterRender(buffer)  ← hook opcional
 */

export interface ReportContext {
  from?: string;
  to?: string;
  status?: string;
  generatedBy?: string;
}

export abstract class ReportGenerator<TRow, TBuffer = Buffer> {
  /** Punto de entrada — NO se overridea (es el template method). */
  async generate(ctx: ReportContext): Promise<TBuffer> {
    this.validate(ctx);
    const raw = await this.loadData(ctx);
    const transformed = this.transform(raw);
    const buffer = await this.format(transformed, ctx);
    this.afterRender(buffer);
    return buffer;
  }

  protected validate(ctx: ReportContext): void {
    if (ctx.from && ctx.to && new Date(ctx.from) > new Date(ctx.to)) {
      throw new Error('Rango de fechas inválido: "from" es posterior a "to"');
    }
  }

  /** Hook con default — la subclase puede sobreescribir si necesita. */
  protected transform(rows: TRow[]): TRow[] {
    return rows;
  }

  /** Hook con default vacío. */
  protected afterRender(_buffer: TBuffer): void {
    /* no-op */
  }

  // ────── métodos abstractos que cada formato implementa ──────
  protected abstract loadData(ctx: ReportContext): Promise<TRow[]>;
  protected abstract format(rows: TRow[], ctx: ReportContext): Promise<TBuffer>;
}
