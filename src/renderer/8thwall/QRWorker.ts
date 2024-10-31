/// This module contains a WebWorker for scanning and parsing QR data.
import { scanGrayBuffer, Point } from '@undecaf/zbar-wasm';

// declare const self: DedicatedWorkerGlobalScope;

export type ZBarScanResult = {
    text: string;
    points: Point[];
    quality: number;
};

export async function scanGrayscaleForQR(
    buffer: ArrayBuffer,
    width: number,
    height: number,
): Promise<ZBarScanResult[]> {
    const scannedSymbols = await scanGrayBuffer(buffer, width, height);
    return scannedSymbols.map((symbol) => {
        return {
            text: symbol.decode(),
            points: symbol.points,
            quality: symbol.quality,
        } as ZBarScanResult;
    });
}
