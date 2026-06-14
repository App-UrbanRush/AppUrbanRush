/**
 * Patrón Command — encapsula una operación administrativa como un objeto
 * con `execute()` y `undo()`. Permite mantener un historial y deshacer
 * acciones críticas (toggle de rol, soft-delete de archivo, etc.).
 */

export interface ICommand<T = unknown> {
  /** Nombre legible para auditoría y UI. */
  readonly name: string;

  /** Ejecuta la operación y retorna el resultado. */
  execute(): Promise<T>;

  /** Deshace la operación. Lanza si no es reversible. */
  undo(): Promise<void>;
}
