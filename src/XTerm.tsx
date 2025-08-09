import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { CanvasAddon } from '@xterm/addon-canvas';
import type { ITerminalInitOnlyOptions, ITerminalOptions } from '@xterm/xterm';
import type React from 'react';
import { memo, useEffect, useRef } from 'react';
import { TerminalWithStream } from './terminal-with-stream';

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
    const webglAddon = new WebglAddon();
    const fitAddon = new FitAddon();
    terminal.loadAddon(canvasAddon);
    // terminal.loadAddon(webglAddon);
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);
    fitAddon.fit();
    ref.current = terminal;

    const unsubscribe = webglAddon.onContextLoss(() => {
      webglAddon.dispose();
    });
    const observer = new ResizeObserver(() => {
      fitAddon.fit();
    });
    observer.observe(containerRef.current);

    return () => {
      ref.current = null;
      observer.disconnect();
      unsubscribe.dispose();
      fitAddon.dispose();
      webglAddon.dispose();
      terminal.dispose();
    };
  }, [ref, options]);

  return <div ref={containerRef} {...props} />;
});
