import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import type React from 'react';
import { useEffect, useRef } from 'react';

import '@xterm/xterm/css/xterm.css';

export interface XTermProps extends React.HTMLAttributes<HTMLDivElement> {
  reader?: ReadableStreamDefaultReader<string | Uint8Array>;
  writer?: WritableStreamDefaultWriter<string>;
}

export function XTerm({ reader, writer, ...props }: XTermProps) {
  const container = useRef<HTMLDivElement>(null);
  const terminal = useRef(new Terminal());
  const fitAddon = useRef(new FitAddon());

  // XTerm
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      fitAddon.current.fit();
    });
    if (container.current) {
      terminal.current.loadAddon(fitAddon.current);
      terminal.current.open(container.current);
      fitAddon.current.fit();
      observer.observe(container.current);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  // Reader
  useEffect(() => {
    if (!terminal.current || !reader) {
      return;
    }
    reader.read().then(function loop({ value, done }) {
      if (done) {
        reader.releaseLock();
        return;
      }
      terminal.current?.write(value);
      reader.read().then(loop);
    });
  }, [reader]);

  // Writer
  useEffect(() => {
    if (!terminal.current || !writer) {
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
}
