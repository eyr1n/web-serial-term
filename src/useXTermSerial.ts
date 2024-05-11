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
    open: async (options: XTermSerialOptions) => {
      await serial.current.open(options);
      setReader(serial.current.reader);
      setWriter(serial.current.writer);
      setClosed(false);
    },
    close: async () => {
      await serial.current.close();
      setClosed(true);
    },
  };
}
