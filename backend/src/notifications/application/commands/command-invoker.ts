import { Injectable, Logger } from '@nestjs/common';
import { ICommand } from './command.interface';

/**
 * Invoker del patrón Command: ejecuta comandos y mantiene una pila
 * acotada de historia para soportar `undoLast()`.
 *
 * Es Singleton (por ser @Injectable() de Nest), así que cualquier
 * controller que lo inyecte comparte la misma historia.
 */
@Injectable()
export class CommandInvoker {
  private readonly logger = new Logger(CommandInvoker.name);
  private readonly history: ICommand[] = [];
  private static readonly MAX_HISTORY = 50;

  async run<T>(command: ICommand<T>): Promise<T> {
    const result = await command.execute();
    this.history.push(command);
    if (this.history.length > CommandInvoker.MAX_HISTORY) this.history.shift();
    this.logger.log(`Ejecutado: ${command.name}`);
    return result;
  }

  async undoLast(): Promise<{ undone: string } | null> {
    const cmd = this.history.pop();
    if (!cmd) return null;
    await cmd.undo();
    this.logger.log(`Deshecho: ${cmd.name}`);
    return { undone: cmd.name };
  }

  recent(limit = 10): { name: string }[] {
    return this.history.slice(-limit).map((c) => ({ name: c.name }));
  }
}
