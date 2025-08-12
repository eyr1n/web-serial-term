import { Button, Stack } from '@mui/material';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useRef } from 'react';
import { ConfigInput } from './components/ConfigInput';
import { XTerm } from './components/XTerm';
import { DEFAULT_CONFIG } from './config';
import { useSerialPort } from './hooks/useSerialPort';
import type { TerminalWithStream } from './terminal-with-stream';

export function App() {
  const [config, setConfig] = useLocalStorage('config', DEFAULT_CONFIG);
  const terminalRef = useRef<TerminalWithStream>(null);
  const { open, close, connected } = useSerialPort();

  return (
    <Stack direction="row">
      <XTerm
        ref={terminalRef}
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
            disabled={connected}
          />

          <Button
            variant="contained"
            color={connected ? 'secondary' : 'success'}
            disabled={config.serialOptions.baudRate < 1}
            onClick={async () => {
              if (!terminalRef.current) {
                return;
              }
              try {
                if (connected) {
                  await close();
                } else {
                  terminalRef.current.options.convertEol =
                    config.receiveNewline === 'LF';
                  await open(
                    config,
                    terminalRef.current.readable,
                    terminalRef.current.writable,
                  );
                }
              } catch (error) {
                window.alert(error);
              }
            }}
          >
            {connected ? 'Close' : 'Open'} port
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() => terminalRef.current?.reset()}
          >
            Reset terminal
          </Button>

          <Button
            variant="contained"
            onClick={async () => {
              if (!terminalRef.current) {
                return;
              }

              terminalRef.current.selectAll();
              const text = terminalRef.current.getSelection();
              terminalRef.current.clearSelection();

              const writable = await window
                .showSaveFilePicker()
                .then((handle) => handle.createWritable());
              await new Blob([text], { type: 'text/plain' })
                .stream()
                .pipeTo(writable);

              window.alert('Log downloaded successfully.');
            }}
          >
            Download log
          </Button>
        </Stack>

        <Button
          variant="contained"
          color="error"
          disabled={connected}
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
