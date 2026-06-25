export interface Nucleobase {
  readonly domNode: SVGTextElement;

  readonly id: string;

  readonly centerPoint: {
    readonly x: number;
    readonly y: number;
  };

  addEventListener(name: 'change', listener: () => void): void;

  removeEventListener(name: 'change', listener: () => void): void;
}
