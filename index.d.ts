type CompressImageFn = (imageConfig: {
 width: number;
 height: number;
 src: string;
 quality?: string;
}) => Promise<string>;

interface KarasOption {
  quality?: string;
  compressImage: CompressImageFn;
  useCanvasCompress?: boolean;
}

declare enum Level {
  NONE,
  ABBR,
  DUPLICATE,
  ALL,
}

declare class KarasCompress {
  constructor(json: string|object, options:KarasOption);
  compress(level: Level, positionPrecision: number): Promise<object>;
}
