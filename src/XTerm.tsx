import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { Terminal } from '@xterm/xterm';
import type React from 'react';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import '@xterm/xterm/css/xterm.css';

export interface XTermProps extends React.HTMLAttributes<HTMLDivElement> {
  reader?: ReadableStreamDefaultReader<string | Uint8Array>;
  writer?: WritableStreamDefaultWriter<string>;
}

export const XTerm = forwardRef<Terminal, XTermProps>(function XTerm(
  { reader, writer, ...props }: XTermProps,
  ref,
) {
  const container = useRef<HTMLDivElement>(null);
  const terminal = useRef(new Terminal());

  useImperativeHandle(ref, () => terminal.current, []);

  useEffect(() => {
    if (!container.current) {
      return;
    }
    const webglAddon = new WebglAddon();
    const fitAddon = new FitAddon();
    terminal.current.loadAddon(webglAddon);
    terminal.current.loadAddon(fitAddon);
    terminal.current.open(container.current);
    fitAddon.fit();

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
    };
  }, []);

  // Reader
  useEffect(() => {
    if (!reader) {
      return;
    }
    const controller = new AbortController();
    const readLoop = ({
      value,
      done,
    }: ReadableStreamReadResult<string | Uint8Array>) => {
      if (done) {
        reader.releaseLock();
        return;
      }
      terminal.current?.write(value);
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
  }, [reader]);

  // Writer
  useEffect(() => {
    if (!writer) {
      return;
    }
    const onData = terminal.current.onData((data) => writer.write(data));
    return () => {
      onData.dispose();
    };
  }, [writer]);

  return <div ref={container} {...props} />;
});

function abortable<T>(promise: Promise<T>, signal: AbortSignal) {
  return new Promise<T>((resolve, reject) => {
    signal.addEventListener('abort', reject, { once: true });
    promise.then(resolve, reject);
  });
}
