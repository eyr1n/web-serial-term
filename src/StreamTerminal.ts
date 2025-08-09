import {
  type IDisposable,
  type ITerminalInitOnlyOptions,
  type ITerminalOptions,
  Terminal,
} from '@xterm/xterm';

export class StreamTerminal extends Terminal {
  #readable: ReadableStream<string>;
  #writable: WritableStream<string | Uint8Array>;
  #unsubscribe?: IDisposable;

  get readable(): ReadableStream<string> {
    return this.#readable;
  }

  get writable(): WritableStream<string | Uint8Array> {
    return this.#writable;
  }

  constructor(options?: ITerminalOptions & ITerminalInitOnlyOptions) {
    super(options);

    this.#readable = new ReadableStream<string>({
      start: (controller) => {
        this.#unsubscribe = this.onData((data) => {
          controller.enqueue(data);
        });
      },
      cancel: () => {
        this.#unsubscribe?.dispose();
        this.#unsubscribe = undefined;
      },
    });

    this.#writable = new WritableStream<string | Uint8Array>({
      write: (chunk) => {
        this.write(chunk);
      },
    });
  }

  override dispose(): void {
    this.#unsubscribe?.dispose();
    this.#unsubscribe = undefined;
    super.dispose();
  }
}
