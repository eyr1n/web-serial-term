import { useRef, useState } from 'react';
import { XTermSerial, type XTermSerialOptions } from './XTermSerial';

export function useXTermSerial() {
  const serial = useRef(new XTermSerial());
  const [reader, setReader] =
    useState<ReadableStreamDefaultReader<Uint8Array>>();
  const [writer, setWriter] = useState<WritableStreamDefaultWriter<string>>();
  const [closed, setClosed] = useState(true);

  return {
    reader,
    writer,
    closed,
    open: (options: XTermSerialOptions) =>
      serial.current
        .open(options)
        .then(() => {
          setReader(serial.current.reader);
          setWriter(serial.current.writer);
          setClosed(false);
        })
        .catch((e) => window.alert(e)),
    close: () =>
      serial.current
        .close()
        .then(() => {
          setReader(undefined);
          setWriter(undefined);
          setClosed(true);
        })
        .catch((e) => window.alert(e)),
  };
}
