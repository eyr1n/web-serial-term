import { useCallback, useRef, useState } from 'react';
import { CharacterReplaceStream } from '../character-replace-stream';
import type { Config } from '../config';

export function useSerialPort() {
  const closeRef = useRef<() => Promise<void>>(null);
  const [connected, setConnected] = useState(false);

  const open = useCallback(
    async (
      config: Config,
      readable: ReadableStream<string>,
      writable: WritableStream<string | Uint8Array>,
    ) => {
      const port = await navigator.serial.requestPort().catch(() => undefined);
      if (!port) {
        return;
      }

      try {
        const onDisconnect = async () => {
          window.alert('The device has been lost.');
          await close();
        };
        port.addEventListener('disconnect', onDisconnect);

        await port.open(config.serialOptions);
        if (!port.readable || !port.writable) {
          throw new Error('The port is not readable and writable.');
        }

        const abortController = new AbortController();
        const streamClosed = Promise.allSettled([
          port.readable.pipeTo(writable, {
            signal: abortController.signal,
            preventAbort: true,
            preventClose: true,
          }),
          readable
            .pipeThrough(
              new CharacterReplaceStream('\r', config.transmitNewline),
              {
                signal: abortController.signal,
              },
            )
            .pipeThrough(new TextEncoderStream(), {
              signal: abortController.signal,
            })
            .pipeTo(port.writable, {
              signal: abortController.signal,
              preventCancel: true,
            }),
        ]);

        const close = async () => {
          try {
            abortController.abort();
            await streamClosed.catch(() => {});
            if (port.connected) {
              await port.close();
            }
          } finally {
            port.removeEventListener('disconnect', onDisconnect);
            setConnected(false);
          }
        };

        closeRef.current = close;
        setConnected(true);
      } catch (error) {
        window.alert(error);
      }
    },
    [],
  );

  const close = useCallback(async () => {
    await closeRef.current?.();
  }, []);

  return { open, close, connected };
}
