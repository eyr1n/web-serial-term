import { CanvasAddon } from '@xterm/addon-canvas';
import { FitAddon } from '@xterm/addon-fit';
import type { ITerminalInitOnlyOptions, ITerminalOptions } from '@xterm/xterm';
import type React from 'react';
import { memo, useEffect, useRef } from 'react';
import { TerminalWithStream } from '../terminal-with-stream';

import '@xterm/xterm/css/xterm.css';

interface XTermProps extends React.HTMLAttributes<HTMLDivElement> {
  ref: React.RefObject<TerminalWithStream | null>;
  options?: ITerminalOptions & ITerminalInitOnlyOptions;
}

export const XTerm = memo(function XTerm({
  ref,
  options,
  ...props
}: XTermProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const terminal = new TerminalWithStream(options);
    const canvasAddon = new CanvasAddon();
    const fitAddon = new FitAddon();
    terminal.loadAddon(canvasAddon);
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);
    fitAddon.fit();

    const observer = new ResizeObserver(() => {
      fitAddon.fit();
    });
    observer.observe(containerRef.current);

    ref.current = terminal;

    return () => {
      ref.current = null;
      observer.disconnect();
      fitAddon.dispose();
      terminal.dispose();
    };
  }, [ref, options]);

  return <div ref={containerRef} {...props} />;
});
