import { useEffect, useRef, useState } from 'react';
import { XTermSerial, type XTermSerialOptions } from './XTermSerial';

export function useXTermSerial() {
  const serial = useRef(new XTermSerial());
  const [reader, setReader] =
    useState<ReadableStreamDefaultReader<Uint8Array>>();
  const [writer, setWriter] = useState<WritableStreamDefaultWriter<string>>();
  const [closed, setClosed] = useState(true);

  const open = (options: XTermSerialOptions) =>
    serial.current
      .open(options)
      .then(() => {
        setReader(serial.current.reader);
        setWriter(serial.current.writer);
        setClosed(false);
      })
      .catch(alert);

  const close = () =>
    serial.current
      .close()
      .then(() => {
        setReader(undefined);
        setWriter(undefined);
        setClosed(true);
      })
      .catch(alert);

  useEffect(() => {
    const listener = () => {
      alert('The device has been lost.');
      close();
    };
    navigator.serial.addEventListener('disconnect', listener);
    return () => {
      navigator.serial.removeEventListener('disconnect', listener);
    };
  }, [close]);

  return {
    reader,
    writer,
    closed,
    open,
    close,
  };
}
