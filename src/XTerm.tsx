import { FitAddon } from '@xterm/addon-fit';
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

  // XTerm
  useEffect(() => {
    if (!container.current) {
      return;
    }
    const fitAddon = new FitAddon();
    const observer = new ResizeObserver(() => {
      fitAddon.fit();
    });
    terminal.current.loadAddon(fitAddon);
    terminal.current.open(container.current);
    fitAddon.fit();
    observer.observe(container.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Reader
  useEffect(() => {
    if (!reader) {
      return;
    }
    const controller = new AbortController();
    abortable(reader.read(), controller.signal)
      .then(function loop({ value, done }) {
        if (done) {
          reader.releaseLock();
          return;
        }
        terminal.current?.write(value);
        abortable(reader.read(), controller.signal).then(loop);
      })
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
    const onData = terminal.current.onData(async (data) => {
      await writer.write(data);
    });
    return () => {
      onData.dispose();
    };
  }, [writer]);

  return <div ref={container} {...props} />;
});

function abortable<T>(promise: Promise<T>, signal: AbortSignal) {
  return new Promise<T>((resolve, reject) => {
    promise.then(resolve);
    signal.addEventListener('abort', reject, { once: true });
  });
}
