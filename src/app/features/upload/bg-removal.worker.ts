import { AutoModel, AutoProcessor, RawImage, env } from '@huggingface/transformers';

// Point to WASM files served from root (copied via angular.json assets)
(env as any).backends.onnx.wasm.wasmPaths = '/';

type InMessage =
  | { type: 'load' }
  | { type: 'process'; blob: Blob };

type OutMessage =
  | { type: 'ready' }
  | { type: 'progress'; stage: 'loading' | 'processing'; pct: number }
  | { type: 'done'; blob: Blob }
  | { type: 'error'; message: string };

let model: any = null;
let processor: any = null;

async function loadModel(): Promise<void> {
  self.postMessage({ type: 'progress', stage: 'loading', pct: 0 } as OutMessage);
  model = await AutoModel.from_pretrained('briaai/RMBG-2.0', {
    device: 'wasm',
    progress_callback: (p: any) => {
      if (p.status === 'progress') {
        self.postMessage({
          type: 'progress',
          stage: 'loading',
          pct: Math.round(p.progress ?? 0),
        } as OutMessage);
      }
    },
  });
  processor = await AutoProcessor.from_pretrained('briaai/RMBG-2.0');
  self.postMessage({ type: 'ready' } as OutMessage);
}

async function processImage(blob: Blob): Promise<void> {
  self.postMessage({ type: 'progress', stage: 'processing', pct: 0 } as OutMessage);
  const url = URL.createObjectURL(blob);
  try {
    const image = await RawImage.fromURL(url);
    const { pixel_values } = await processor(image);
    self.postMessage({ type: 'progress', stage: 'processing', pct: 30 } as OutMessage);

    const { output } = await model({ input: pixel_values });
    self.postMessage({ type: 'progress', stage: 'processing', pct: 70 } as OutMessage);

    // Build mask at original image dimensions
    const maskTensor = output[0].mul(255).to('uint8');
    const mask = await RawImage.fromTensor(maskTensor).resize(image.width, image.height);

    // Compose RGBA image: original RGB + mask alpha
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(image.width, image.height);
    const srcData = image.data as Uint8Array;
    const maskData = mask.data as Uint8Array;

    for (let i = 0; i < image.width * image.height; i++) {
      imageData.data[i * 4]     = srcData[i * 3];
      imageData.data[i * 4 + 1] = srcData[i * 3 + 1];
      imageData.data[i * 4 + 2] = srcData[i * 3 + 2];
      imageData.data[i * 4 + 3] = maskData[i];
    }
    ctx.putImageData(imageData, 0, 0);

    const processedBlob = await canvas.convertToBlob({ type: 'image/png' });
    self.postMessage({ type: 'progress', stage: 'processing', pct: 100 } as OutMessage);
    self.postMessage({ type: 'done', blob: processedBlob } as OutMessage);
  } finally {
    URL.revokeObjectURL(url);
  }
}

self.onmessage = async (event: MessageEvent<InMessage>) => {
  try {
    if (event.data.type === 'load') await loadModel();
    if (event.data.type === 'process') await processImage(event.data.blob);
  } catch (err) {
    self.postMessage({ type: 'error', message: String(err) } as OutMessage);
  }
};
