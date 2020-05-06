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

interface compressOption {
  image?: boolean;
  abbr?: boolean;
  duplicate?: boolean;
  positionPrecision?: number;
}

declare class KarasCompress {
  constructor(json: string|object, options:KarasOption);
  compress(option: compressOption): Promise<object>;
}
