export class CharacterReplaceStream extends TransformStream<string, string> {
  constructor(from: string, to: string) {
    super({
      transform: (chunk, controller) => {
        controller.enqueue(chunk.replaceAll(from, to));
      },
    });
  }
}
