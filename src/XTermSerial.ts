const CR = '\r'.charCodeAt(0);
const LF = '\n'.charCodeAt(0);

export type NewlineCharacter = 'CR' | 'LF' | 'CR+LF';

export interface XTermSerialOptions extends SerialOptions {
  receiveNewline: NewlineCharacter;
  transmitNewline: NewlineCharacter;
}

export class XTermSerial {
  #port?: SerialPort;
  #reader?: ReadableStreamDefaultReader<Uint8Array>;
  #readerClosed?: Promise<void>;
  #writer?: WritableStreamDefaultWriter<string>;
  #writerClosed?: Promise<void>;

  async open({
    receiveNewline,
    transmitNewline,
    ...options
  }: XTermSerialOptions) {
    this.#port = await navigator.serial.requestPort();
    await this.#port.open(options);
    if (!this.#port.readable || !this.#port.writable) {
      throw new Error('The port is not readable and writable.');
    }

    const readerStream = new XTermSerialReceiveStream(receiveNewline);
    this.#readerClosed = this.#port.readable.pipeTo(readerStream.writable);
    this.#reader = readerStream.readable.getReader();

    const writerStream = new TextEncoderStream();
    this.#writerClosed = writerStream.readable
      .pipeThrough(new XTermSerialTransmitStream(transmitNewline))
      .pipeTo(this.#port.writable);
    this.#writer = writerStream.writable.getWriter();
  }

  async close() {
    this.#reader?.cancel();
    await this.#readerClosed?.catch(() => {});
    this.#writer?.close();
    await this.#writerClosed?.catch(() => {});
    await this.#port?.close();
  }

  get reader() {
    return this.#reader;
  }

  get writer() {
    return this.#writer;
  }
}

class XTermSerialReceiveStream extends TransformStream<Uint8Array, Uint8Array> {
  constructor(newLine: NewlineCharacter) {
    super({
      transform: (chunk, controller) => {
        switch (newLine) {
          case 'CR':
            controller.enqueue(
              Uint8Array.from(
                [...chunk].flatMap((byte) => (byte === CR ? [CR, LF] : byte)),
              ),
            );
            break;
          case 'LF':
            controller.enqueue(
              Uint8Array.from(
                [...chunk].flatMap((byte) => (byte === LF ? [CR, LF] : byte)),
              ),
            );
            break;
          case 'CR+LF':
            controller.enqueue(chunk);
            break;
        }
      },
    });
  }
}

class XTermSerialTransmitStream extends TransformStream<
  Uint8Array,
  Uint8Array
> {
  constructor(newLine: NewlineCharacter) {
    super({
      transform: (chunk, controller) => {
        switch (newLine) {
          case 'CR':
            controller.enqueue(chunk);
            break;
          case 'LF':
            controller.enqueue(
              Uint8Array.from(
                [...chunk].map((byte) => (byte === CR ? LF : byte)),
              ),
            );
            break;
          case 'CR+LF':
            controller.enqueue(
              Uint8Array.from(
                [...chunk].flatMap((byte) => (byte === CR ? [CR, LF] : byte)),
              ),
            );
            break;
        }
      },
    });
  }
}
