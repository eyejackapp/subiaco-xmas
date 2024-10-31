import { MediaRecorderProps } from '.';

type WatermarkConfig = Partial<MediaRecorderProps> & {
    watermarkImage: HTMLImageElement | undefined;
    watermarkLocation: string;
};

/* globals XR8 */
const currentConfig: WatermarkConfig = {} as WatermarkConfig;

const internalConfig: WatermarkConfig = {} as WatermarkConfig;

let waitingOnXr = false;

let loadedWatermarkUrl: string | undefined;

const updateWatermarkImage = () => {
    const newImageUrl = internalConfig.watermarkImageUrl;
    if (newImageUrl === loadedWatermarkUrl) {
        return;
    }

    loadedWatermarkUrl = newImageUrl;

    if (!loadedWatermarkUrl) {
        internalConfig.watermarkImage = undefined;
        return;
    }

    const img = document.createElement('img');

    img.onload = () => {
        internalConfig!.watermarkImage = img;
    };

    img.onerror = () => {
        console.error(`Failed to load image from ${img.src}`);
        internalConfig!.watermarkImage = undefined;
    };

    img.setAttribute('crossorigin', 'anonymous');
    img.setAttribute('src', loadedWatermarkUrl);
};

const updateConfig = () => {
    console.log('update config', currentConfig);
    // @ts-expect-error
    XR8.MediaRecorder.configure(currentConfig);
};

const internalKeys = new Set([
    'watermarkImageUrl',
    'watermarkMaxWidth',
    'watermarkMaxHeight',
    'watermarkLocation',
    'fileNamePrefix',
    'onProcessFrame',
]);

export const configure = (config: Partial<MediaRecorderProps>) => {
    Object.keys(config).forEach((key) => {
        const value = config[key as keyof Partial<MediaRecorderProps>];
        if (value === undefined) {
            return;
        }

        if (internalKeys.has(key)) {
            (internalConfig as any)[key] = value;
        } else {
            (currentConfig as any)[key] = value;
        }
    });

    updateWatermarkImage();

    if (window.XR8) {
        updateConfig();
    } else if (!waitingOnXr) {
        waitingOnXr = true;
        window.addEventListener('xrloaded', updateConfig, { once: true });
    }
};

export const getConfig = () => internalConfig;
