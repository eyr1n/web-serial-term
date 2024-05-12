import type { IDisposable, Terminal } from '@xterm/xterm';

export class StreamAddon implements IDisposable {
  #reader: ReadableStreamDefaultReader<string | Uint8Array>;
  #writer: WritableStreamDefaultWriter<string>;
  #disposables: IDisposable[] = [];

  constructor(
    reader: ReadableStreamDefaultReader<string | Uint8Array>,
    writer: WritableStreamDefaultWriter<string>,
  ) {
    this.#reader = reader;
    this.#writer = writer;
  }

  activate(terminal: Terminal) {
    const controller = new AbortController();
    const readLoop = ({
      value,
      done,
    }: ReadableStreamReadResult<string | Uint8Array>) => {
      if (done) {
        this.#reader.releaseLock();
        return;
      }
      terminal.write(value);
      abortable(this.#reader.read(), controller.signal)
        .then(readLoop)
        .catch(() => this.#reader.cancel());
    };
    abortable(this.#reader.read(), controller.signal)
      .then(readLoop)
      .catch(() => this.#reader.cancel());
    this.#disposables.push({
      dispose: () => controller.abort(),
    });

    this.#disposables.push(terminal.onData((data) => this.#writer.write(data)));
  }

  dispose() {
    for (const disposable of this.#disposables) {
      disposable.dispose();
    }
    this.#disposables = [];
  }
}

function abortable<T>(promise: Promise<T>, signal: AbortSignal) {
  return new Promise<T>((resolve, reject) => {
    promise.then(resolve);
    signal.addEventListener('abort', reject, { once: true });
  });
}
