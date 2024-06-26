import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import type { Terminal } from '@xterm/xterm';
import { useEffect, useMemo, useRef } from 'react';
import { XTerm } from './XTerm';
import type { NewlineCharacter, XTermSerialOptions } from './XTermSerial';
import { useLocalStorage } from './useLocalStorage';
import { useXTermSerial } from './useXTermSerial';

const BAUD_RATE = [
  110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200,
  128000, 230400, 460800, 921600,
];
const DATA_BITS = [7, 8];
const STOP_BITS = [1, 2];
const PARITY: ParityType[] = ['none', 'even', 'odd'];
const FLOW_CONTROL: FlowControlType[] = ['none', 'hardware'];
const NEWLINE_CHARACTER: NewlineCharacter[] = ['CR', 'LF', 'CR+LF'];

const DEFAULT_OPTIONS: XTermSerialOptions = {
  baudRate: BAUD_RATE[11],
  dataBits: DATA_BITS[1],
  stopBits: STOP_BITS[0],
  parity: PARITY[0],
  flowControl: FLOW_CONTROL[0],
  receiveNewline: NEWLINE_CHARACTER[2],
  transmitNewline: NEWLINE_CHARACTER[0],
};
const DEFAULT_BUFFER_SIZE = '255';

export function App() {
  const [options, setOptions] = useLocalStorage('options', DEFAULT_OPTIONS);
  const [bufferSize, setBufferSize] = useLocalStorage(
    'bufferSize',
    DEFAULT_BUFFER_SIZE,
  );
  const bufferSizeError = useMemo(() => {
    const value = Number.parseInt(bufferSize);
    return Number.isNaN(value) || value < 1;
  }, [bufferSize]);
  const updateOptions = (options: Partial<XTermSerialOptions>) =>
    setOptions((prev) => ({ ...prev, ...options }));
  const resetOptions = () => {
    setOptions(DEFAULT_OPTIONS);
    setBufferSize(DEFAULT_BUFFER_SIZE);
  };

  const terminal = useRef<Terminal>(null);
  const { port, reader, writer, closed, open, close } = useXTermSerial();

  useEffect(() => {
    if (!port) {
      return;
    }
    const listener = () => {
      alert('The device has been lost.');
      close();
    };
    port.addEventListener('disconnect', listener);
    return () => {
      port.removeEventListener('disconnect', listener);
    };
  }, [close, port]);

  return (
    <>
      <Stack direction="row">
        <XTerm
          ref={terminal}
          reader={reader}
          writer={writer}
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
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Baud rate</InputLabel>
                <Select
                  label="Baud rate"
                  disabled={!closed}
                  value={options.baudRate}
                  onChange={(e) =>
                    updateOptions({ baudRate: e.target.value as number })
                  }
                >
                  {BAUD_RATE.map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  label="Buffer size"
                  error={bufferSizeError}
                  disabled={!closed}
                  value={bufferSize}
                  onChange={(e) => {
                    if (/^[0-9]*$/.test(e.target.value)) {
                      setBufferSize(e.target.value);
                    }
                  }}
                />
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Data bits</InputLabel>
                <Select
                  label="Data bits"
                  disabled={!closed}
                  value={options.dataBits}
                  onChange={(e) =>
                    updateOptions({ dataBits: e.target.value as number })
                  }
                >
                  {DATA_BITS.map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Stop bits</InputLabel>
                <Select
                  label="Stop bits"
                  disabled={!closed}
                  value={options.stopBits}
                  onChange={(e) =>
                    updateOptions({ stopBits: e.target.value as number })
                  }
                >
                  {STOP_BITS.map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Parity</InputLabel>
                <Select
                  label="Parity"
                  disabled={!closed}
                  value={options.parity}
                  onChange={(e) =>
                    updateOptions({ parity: e.target.value as ParityType })
                  }
                >
                  {PARITY.map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Flow control</InputLabel>
                <Select
                  label="Flow control"
                  disabled={!closed}
                  value={options.flowControl}
                  onChange={(e) =>
                    updateOptions({
                      flowControl: e.target.value as FlowControlType,
                    })
                  }
                >
                  {FLOW_CONTROL.map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Receive newline</InputLabel>
                <Select
                  label="Receive newline"
                  disabled={!closed}
                  value={options.receiveNewline}
                  onChange={(e) =>
                    updateOptions({
                      receiveNewline: e.target.value as NewlineCharacter,
                    })
                  }
                >
                  {NEWLINE_CHARACTER.map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Transmit newline</InputLabel>
                <Select
                  label="Transmit newline"
                  disabled={!closed}
                  value={options.transmitNewline}
                  onChange={(e) =>
                    updateOptions({
                      transmitNewline: e.target.value as NewlineCharacter,
                    })
                  }
                >
                  {NEWLINE_CHARACTER.map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Button
              variant="contained"
              color={closed ? 'success' : 'secondary'}
              disabled={bufferSizeError}
              onClick={
                closed
                  ? () =>
                      open({
                        ...options,
                        bufferSize: Number.parseInt(bufferSize),
                      }).catch(alert)
                  : () => close().catch(alert)
              }
            >
              {closed ? 'Open' : 'Close'} port
            </Button>

            <Button
              variant="contained"
              onClick={() => terminal.current?.reset()}
            >
              Reset terminal
            </Button>
          </Stack>

          <Button
            variant="contained"
            color="error"
            disabled={!closed}
            onClick={resetOptions}
          >
            Reset options
          </Button>
        </Stack>
      </Stack>
      {/* <PWABadge /> */}
    </>
  );
}
