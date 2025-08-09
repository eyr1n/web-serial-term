import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import type { ITerminalInitOnlyOptions, ITerminalOptions } from '@xterm/xterm';
import type React from 'react';
import { useEffect, useRef } from 'react';

import '@xterm/xterm/css/xterm.css';
import { TerminalWithStream } from './terminal-with-stream';

export interface XTermProps extends React.HTMLAttributes<HTMLDivElement> {
  ref: React.RefObject<TerminalWithStream | null>;
  options?: ITerminalOptions & ITerminalInitOnlyOptions;
}

export function XTerm({ ref, options, ...props }: XTermProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) {
      return;
    }
    const terminal = new TerminalWithStream(options);
    const webglAddon = new WebglAddon();
    const fitAddon = new FitAddon();
    terminal.loadAddon(webglAddon);
    terminal.loadAddon(fitAddon);
    terminal.open(container.current);
    fitAddon.fit();
    ref.current = terminal;

    const listener = webglAddon.onContextLoss(() => {
      webglAddon.dispose();
    });
    const observer = new ResizeObserver(() => {
      fitAddon.fit();
    });
    observer.observe(container.current);

    return () => {
      observer.disconnect();
      listener.dispose();
      webglAddon.dispose();
      fitAddon.dispose();
      terminal.dispose();
      ref.current = null;
    };
  }, [ref, options]);

  /* useEffect(() => {
    const controller = new AbortController();
    if (readable && ref.current) {
      readable.pipeTo(ref.current.writable, { signal: controller.signal });
    }
    if (writable) {
      ref.current?.readable.pipeTo(writable, { signal: controller.signal });
    }
    return () => {
      controller.abort();
    };
  }, [readable, writable, ref]);
 */
  return <div ref={container} {...props} />;
}
/* 
import { Terminal } from '@xterm/xterm';

export class StreamTerminal extends Terminal {
  pipeToReader(reader: ReadableStreamDefaultReader<string | Uint8Array>) {
    const controller = new AbortController();
    const readLoop = ({
      value,
      done,
    }: ReadableStreamReadResult<string | Uint8Array>) => {
      if (done) {
        reader.releaseLock();
        return;
      }
      this.write(value);
      abortable(reader.read(), controller.signal)
        .then(readLoop)
        .catch(() => {});
    };
    abortable(reader.read(), controller.signal)
      .then(readLoop)
      .catch(() => {});
    return () => {
      controller.abort();
    };
  }

  pipeToWriter(writer: WritableStreamDefaultWriter<string>) {
    const onData = this.onData((data) => writer.write(data));
    return () => {
      onData.dispose();
    };
  }
}

function abortable<T>(promise: Promise<T>, signal: AbortSignal) {
  return new Promise<T>((resolve, reject) => {
    signal.addEventListener('abort', reject, { once: true });
    promise.then(resolve, reject);
  });
}
 */
