import { Button, Stack } from '@mui/material';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useRef, useState } from 'react';
import { CharacterReplaceStream } from './character-replace-stream';
import { ConfigInput } from './components/ConfigInput';
import { XTerm } from './components/XTerm';
import { DEFAULT_CONFIG } from './config';
import type { TerminalWithStream } from './terminal-with-stream';

class Hoge {
  #port?: SerialPort;
  #controller?: AbortController;
  #closed?: Promise<[PromiseSettledResult<void>, PromiseSettledResult<void>]>;

  get port() {
    return this.#port;
  }

  async open(options: SerialOptions, terminal: TerminalWithStream) {
    this.#port = await navigator.serial.requestPort();
    await this.#port.open(options);
    if (!this.#port.readable || !this.#port.writable) {
      throw new Error('The port is not readable and writable.');
    }

    this.#controller = new AbortController();
    this.#closed = Promise.allSettled([
      this.#port.readable.pipeTo(terminal.writable, {
        signal: this.#controller.signal,
        preventAbort: true,
        preventClose: true,
      }),
      terminal.readable
        .pipeThrough(new CharacterReplaceStream('\r', '\r\n'), {
          signal: this.#controller.signal,
        })
        .pipeThrough(new TextEncoderStream(), {
          signal: this.#controller.signal,
        })
        .pipeTo(this.#port.writable, {
          signal: this.#controller.signal,
          preventCancel: true,
        }),
    ]);
  }

  async close() {
    this.#controller?.abort();
    this.#controller = undefined;
    await this.#closed?.catch(() => {});
    this.#closed = undefined;
    await this.#port?.close();
    this.#port = undefined;
  }
}

export function App() {
  const [config, setConfig] = useLocalStorage('config', DEFAULT_CONFIG);
  /* const [bufferSize, setBufferSize] = useLocalStorage(
    'bufferSize',
    DEFAULT_BUFFER_SIZE,
  );
  const bufferSizeError = useMemo(() => {
    const value = Number.parseInt(bufferSize);
    return Number.isNaN(value) || value < 1;
  }, [bufferSize]);
  const updateOptions = (options: Partial<typeof DEFAULT_OPTIONS>) =>
    setOptions((prev) => ({ ...prev, ...options }));
  const resetOptions = () => {
    setOptions(DEFAULT_OPTIONS);
    setBufferSize(DEFAULT_BUFFER_SIZE);
  }; */

  const terminal = useRef<TerminalWithStream>(null);
  const hoge = useRef(new Hoge());

  const [closed, setClosed] = useState(true);

  const open = async () => {
    if (!terminal.current) {
      return;
    }
    try {
      terminal.current.options.convertEol = config.receiveNewline === 'LF';
      await hoge.current.open(config.serialOptions, terminal.current);
      const listener = () => {
        alert('The device has been lost.');
        hoge.current.close();
        setClosed(true);
      };
      hoge.current.port?.addEventListener('disconnect', listener);
      setClosed(false);
    } catch (error) {
      window.alert(error);
    }
  };

  const close = async () => {
    try {
      await hoge.current.close();
    } catch (error) {
      window.alert(error);
    }
    setClosed(true);
  };

  return (
    <Stack direction="row">
      <XTerm
        ref={terminal}
        style={{
          width: '100%',
          height: '100dvh',
          overflow: 'hidden',
          backgroundColor: '#000000',
        }}
      />

      <Stack
        justifyContent="space-between"
        spacing={2}
        sx={{
          p: 2,
          minWidth: '320px',
          height: '100dvh',
          overflowY: 'auto',
        }}
      >
        <Stack spacing={2}>
          <ConfigInput
            config={config}
            setConfig={setConfig}
            disabled={!closed}
          />

          <Button
            variant="contained"
            color={closed ? 'success' : 'secondary'}
            disabled={config.serialOptions.baudRate < 1}
            onClick={
              closed ? () => open().catch(alert) : () => close().catch(alert)
            }
          >
            {closed ? 'Open' : 'Close'} port
          </Button>

          <Button variant="contained" onClick={() => terminal.current?.reset()}>
            Reset terminal
          </Button>
        </Stack>

        <Button
          variant="contained"
          color="error"
          disabled={!closed}
          onClick={() => {
            if (window.confirm('Are you sure you want to reset the config?')) {
              setConfig(DEFAULT_CONFIG);
            }
          }}
        >
          Reset config
        </Button>
      </Stack>
    </Stack>
  );
}
