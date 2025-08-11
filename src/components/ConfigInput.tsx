import {
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { type Dispatch, type SetStateAction, useCallback } from 'react';
import type { Config } from '../config';

const BAUD_RATE = [
  110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200,
  128000, 230400, 460800, 576000, 921600, 1000000, 1500000, 2000000,
];
const DATA_BITS = [7, 8];
const STOP_BITS = [1, 2];
const PARITY: ParityType[] = ['none', 'even', 'odd'];
const FLOW_CONTROL: FlowControlType[] = ['none', 'hardware'];
const RECEIVE_NEWLINE = ['LF', 'CR+LF'];
const TRANSMIT_NEWLINE = ['CR', 'LF', 'CR+LF'];

interface SidePanelProps {
  config: Config;
  setConfig: Dispatch<SetStateAction<Config>>;
  disabled: boolean;
}

export function ConfigInput({ config, setConfig, disabled }: SidePanelProps) {
  const updateConfig = useCallback(
    (action: (config: Config) => Config) => {
      setConfig((prev) => action(structuredClone(prev)));
    },
    [setConfig],
  );

  return (
    <Stack spacing={2}>
      <Autocomplete
        freeSolo
        fullWidth
        disableClearable
        disabled={disabled}
        options={BAUD_RATE.map((baudRate) => baudRate.toString())}
        inputValue={
          config.serialOptions.baudRate < 0
            ? ''
            : config.serialOptions.baudRate.toString()
        }
        onInputChange={(_, value) => {
          if (/^[0-9]*$/.test(value)) {
            updateConfig((config) => {
              const parsed = Number.parseInt(value);
              config.serialOptions.baudRate = Number.isNaN(parsed)
                ? -1
                : parsed;
              return config;
            });
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Baud rate"
            error={config.serialOptions.baudRate < 1}
          />
        )}
      />

      <Stack direction="row" spacing={2}>
        <FormControl fullWidth>
          <InputLabel>Data bits</InputLabel>
          <Select
            label="Data bits"
            disabled={disabled}
            value={config.serialOptions.dataBits}
            onChange={(event) => {
              updateConfig((config) => {
                config.serialOptions.dataBits = event.target.value;
                return config;
              });
            }}
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
            disabled={disabled}
            value={config.serialOptions.stopBits}
            onChange={(event) => {
              updateConfig((config) => {
                config.serialOptions.stopBits = event.target.value;
                return config;
              });
            }}
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
            disabled={disabled}
            value={config.serialOptions.parity}
            onChange={(event) => {
              updateConfig((config) => {
                config.serialOptions.parity = event.target.value;
                return config;
              });
            }}
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
            disabled={disabled}
            value={config.serialOptions.flowControl}
            onChange={(event) => {
              updateConfig((config) => {
                config.serialOptions.flowControl = event.target.value;
                return config;
              });
            }}
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
            disabled={disabled}
            value={config.receiveNewline}
            onChange={(event) => {
              updateConfig((config) => {
                config.receiveNewline = event.target.value;
                return config;
              });
            }}
          >
            {RECEIVE_NEWLINE.map((x) => (
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
            disabled={disabled}
            value={config.transmitNewline}
            onChange={(event) => {
              updateConfig((config) => {
                config.transmitNewline = event.target.value;
                return config;
              });
            }}
          >
            {TRANSMIT_NEWLINE.map((x) => (
              <MenuItem key={x} value={x}>
                {x}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
}
