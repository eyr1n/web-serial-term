import { useRef, useState } from 'react';
import { XTermSerial, type XTermSerialOptions } from './XTermSerial';

export function useXTermSerial() {
  const serial = useRef(new XTermSerial());
  const [port, setPort] = useState<SerialPort>();
  const [reader, setReader] =
    useState<ReadableStreamDefaultReader<Uint8Array>>();
  const [writer, setWriter] = useState<WritableStreamDefaultWriter<string>>();
  const [closed, setClosed] = useState(true);

  return {
    port,
    reader,
    writer,
    closed,
    open: (options: XTermSerialOptions) =>
      serial.current.open(options).then(() => {
        setPort(serial.current.port);
        setReader(serial.current.reader);
        setWriter(serial.current.writer);
        setClosed(false);
      }),
    close: () =>
      serial.current.close().then(() => {
        setPort(undefined);
        setReader(undefined);
        setWriter(undefined);
        setClosed(true);
      }),
  };
}
