import { useCallback, useRef, useState } from 'react';
import { CharacterReplaceStream } from '../character-replace-stream';
import type { Config } from '../config';

export function useSerialPort() {
  const closeRef = useRef<() => Promise<void>>(null);
  const [isOpen, setIsOpen] = useState(false);

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
      port.addEventListener('disconnect', () => {
        window.alert('The device has been lost.');
        setIsOpen(false);
      });

      try {
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

        closeRef.current = async () => {
          try {
            abortController.abort();
            await streamClosed.catch(() => {});
            await port.close();
          } catch (error) {
            window.alert(error);
          }
          setIsOpen(false);
        };

        setIsOpen(true);
      } catch (error) {
        window.alert(error);
      }
    },
    [],
  );

  const close = useCallback(async () => {
    await closeRef.current?.();
  }, []);

  return { open, close, isOpen };
}
