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
  const { open, close, isOpen } = useSerialPort();

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
            disabled={isOpen}
          />

          <Button
            variant="contained"
            color={isOpen ? 'secondary' : 'success'}
            disabled={config.serialOptions.baudRate < 1}
            onClick={async () => {
              if (!terminalRef.current) {
                return;
              }
              try {
                if (isOpen) {
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
            {isOpen ? 'Close' : 'Open'} port
          </Button>

          <Button
            variant="contained"
            onClick={() => terminalRef.current?.reset()}
          >
            Reset terminal
          </Button>
        </Stack>

        <Button
          variant="contained"
          color="error"
          disabled={isOpen}
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
