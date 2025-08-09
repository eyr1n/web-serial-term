import { useCallback, useRef, useState } from 'react';
import { XTermSerial, type XTermSerialOptions } from './XTermSerial';

export function useXTermSerial() {
  const serial = useRef(new XTermSerial());
  const [port, setPort] = useState<SerialPort>();
  const [reader, setReader] =
    useState<ReadableStreamDefaultReader<Uint8Array>>();
  const [writer, setWriter] = useState<WritableStreamDefaultWriter<string>>();
  const [closed, setClosed] = useState(true);

  const open = useCallback(
    (options: XTermSerialOptions) =>
      serial.current.open(options).then((result) => {
        setPort(serial.current.port);
        setReader(serial.current.reader);
        setWriter(serial.current.writer);
        setClosed(!result);
      }),
    [],
  );

  const close = useCallback(
    () =>
      serial.current.close().then(() => {
        setPort(undefined);
        setReader(undefined);
        setWriter(undefined);
        setClosed(true);
      }),
    [],
  );

  return {
    port,
    reader,
    writer,
    closed,
    open,
    close,
  };
}
