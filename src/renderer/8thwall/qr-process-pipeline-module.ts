/// <reference types="vite-plugin-comlink/client" />/
//
// This 8thwall module processes the camera input for QR codes
import { IPipelineModule } from '.';
import mitt, { Emitter } from 'mitt';
import { ZBarScanResult } from './QRWorker';

const DEFAULT_SCANS_PER_SECOND = 2;

export type QRPoint = { x: number; y: number };

type QRScanFoundResult = {
    status: 'found';
    data: string;
    points: QRPoint[];
    sourceImageWidth: number;
    sourceImageHeight: number;
};
type QRScanNoneResult = {
    status: 'none';
};
export type QRScanResult = QRScanFoundResult | QRScanNoneResult;

export type QRProcessEvents = {
    'qr-scan-result': QRScanResult;
};

export type QRProcessApi = {
    events: Emitter<QRProcessEvents>;
    setScansPerSecond(scansPerSecond: number): void;
};

type QRProcessResult = [pipelineModule: IPipelineModule, api: QRProcessApi];

const qrProcessPipelineModule = (): QRProcessResult => {
    console.debug('qrProcessPipelineModule: Loaded.');

    const qrWorker = new ComlinkWorker<typeof import('./QRWorker')>(new URL('./QRWorker.ts', import.meta.url));

    let interval = (1 / DEFAULT_SCANS_PER_SECOND) * 1000;
    let lastScan = 0;
    let pendingPromise: Promise<Array<ZBarScanResult>> | undefined;

    const canScan = () => {
        const now = performance.now();
        const canScan = now > lastScan + interval;
        if (canScan) lastScan = now;
        return canScan;
    };

    const events = mitt<QRProcessEvents>();
    const api: QRProcessApi = {
        events,
        setScansPerSecond(scansPerSecond: number) {
            interval = (1 / scansPerSecond) * 1000;
        },
    };

    const mod: IPipelineModule = {
        name: 'qrprocess',
        onProcessCpu: (args) => {
            const { processGpuResult } = args;
            // Check whether there is any data ready to process.
            if (!processGpuResult.camerapixelarray || !processGpuResult.camerapixelarray.pixels) {
                return { found: false };
            }

            // Don't scan if promise still pending or zbar not imported
            if (!pendingPromise && qrWorker && canScan()) {
                const { rows, cols } = processGpuResult.camerapixelarray;
                const arrayBuffer = processGpuResult.camerapixelarray.pixels.buffer;

                pendingPromise = qrWorker.scanGrayscaleForQR(arrayBuffer, cols, rows);

                pendingPromise.then((result) => {
                    pendingPromise = undefined;

                    const [firstScan] = result;
                    if (!firstScan) {
                        events.emit('qr-scan-result', {
                            status: 'none',
                        });
                        return;
                    }

                    events.emit('qr-scan-result', {
                        status: 'found',
                        data: firstScan.text,
                        points: firstScan.points,
                        sourceImageWidth: cols,
                        sourceImageHeight: rows,
                    });
                });
            }
        },
    };

    return [mod, api] as QRProcessResult;
};

export default qrProcessPipelineModule;
