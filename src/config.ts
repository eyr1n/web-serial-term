export interface Config {
  serialOptions: SerialOptions;
  receiveNewline: 'LF' | 'CR+LF';
  transmitNewline: 'CR' | 'LF' | 'CR+LF';
}

export const DEFAULT_CONFIG: Config = {
  serialOptions: {
    baudRate: 11,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    flowControl: 'none',
  },
  receiveNewline: 'CR+LF',
  transmitNewline: 'CR',
};
