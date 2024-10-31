import { EJPlayerBase } from '../libs/ejx.es';
import { configure } from './capture-config';
import {
    EJPlayerPipelineModuleEvents,
    EJPlayerPipelineModuleResult,
    ejPlayerPipelineModule,
} from './ej-player-pipeline-module';
import { QRProcessApi } from './qr-process-pipeline-module';
import qrprocessPipelineModule from './qr-process-pipeline-module';
import { IMediaRecorder, IPipelineModule, IXR8, IXRExtras, MediaRecorderProps } from './types';
import * as THREE from 'three';
export * from './types';

/**
 * Loads a script from a CDN by puytting it in a <script> tag
 * @param url -
 * @returns
 */
const loadScript = (url: string): Promise<void> => {
    return new Promise((res) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';

        script.onload = function () {
            setTimeout(() => {
                res();
            }, 10);
        };

        script.src = url;
        const head = document.getElementsByTagName('head')[0] as HTMLHeadElement;
        head.appendChild(script);
    });
};

/**
 * Initialises 8thwall
 *  @example
 *
 * init('API_KEY', (xr8, xrExtras) => {
 *   // ... setup your pipeline modules here
 * })
 *
 * @param key - API Key for 8thwall
 * @returns
 */
const init = (key: string, config: (xr8: IXR8, xrExtras: IXRExtras) => void): Promise<void> => {
    return new Promise((res, rej) => {
        const dependencies = [
            loadScript('https://cdn.8thwall.com/web/xrextras/xrextras.js'),
            loadScript(`https://apps.8thwall.com/xrweb?appKey=${key}`),
            loadScript('https://cdn.8thwall.com/web/coaching-overlay/coaching-overlay.js'),
        ];

        const showLoading = () => {
            if (!window.XRExtras) {
                setTimeout(() => showLoading(), 20);
            } else {
                window.XRExtras.Loading.showLoading({
                    onxrloaded: () => {
                        config(window.XR8 as unknown as IXR8, window.XRExtras as IXRExtras);
                        res();
                    },
                    onxrerror: (reason: unknown) => {
                        rej(reason);
                    },
                });
            }
        };
        Promise.all(dependencies).then(() => {
            // Once loaded listen for xrextrasloading event
            window.XRExtras ? showLoading() : window.addEventListener('xrextrasloaded', showLoading);
        });
    });
};

let listener: THREE.AudioListener;
let sound: THREE.Audio<GainNode>;

const customMediaConfig = {
    watermarkImageUrl: '',
};

const configureMediaRecorder = ({ watermarkImageUrl }: Partial<MediaRecorderProps>) => {
    listener = new THREE.AudioListener();
    sound = new THREE.Audio(listener);
    const audioConfig = ({ microphoneInput, audioProcessor }: any) => {
        console.log('configure media', listener);
        const audioContext = audioProcessor.context;
        listener.gain.connect(audioProcessor);
        listener.gain.connect(audioContext.destination);

        // const audioLoader = new THREE.AudioLoader();

        // audioLoader.load('/silence.mp3', (buffer) => {
        //     sound.setBuffer(buffer);
        //     sound.setVolume(0.9);
        //     sound.setLoop(true);
        //     sound.play();
        // });
        // const mediaElement = document.getElementById('ejx-audio') as HTMLAudioElement;
        // sound.setMediaElementSource(mediaElement);
        return microphoneInput;
    };

    const customMediaConfig = {
        configureAudioOutput: audioConfig,
        audioContext: THREE.AudioContext.getContext(),
        watermarkImageUrl: watermarkImageUrl,
        watermarkMaxWidth: 60,
        watermarkLocation: 'bottomMiddle',
    };

    configure(customMediaConfig);
};

type EJ8Api = {
    player: EJPlayerBase;
    mediaRecorder: IMediaRecorder;
    qrProcessApi?: QRProcessApi;
    ejPlayerModule: EJPlayerPipelineModuleResult;
    audio: THREE.Audio<GainNode>;
};

export type InitEJ8Options = {
    enableQrScanner?: boolean;
    watermarkImageUrl: string;
};

/**
 * Creates a new instance of the EJPlayer via 8thwall.
 *
 * @param key - 8thWall API key
 * @returns
 */
export const initPlayerWith8thWall = (canvas: HTMLCanvasElement, key: string, options: InitEJ8Options) => {
    return new Promise<EJ8Api>((res) => {
        init(key, (xr8, xrExtras) => {
            xr8.XrController.configure({
                disableWorldTracking: false,
                imageTargets: [],
                enableWorldPoints: true,
                scale: 'absolute',
            });

            const pipelineModules: IPipelineModule[] = [];

            let qrProcessApi: QRProcessApi | undefined;
            if (options.enableQrScanner) {
                pipelineModules.push(xr8.CameraPixelArray.pipelineModule({ luminance: true, maxDimension: 720 }));
                const [qrPipelineModule, api] = qrprocessPipelineModule();
                qrProcessApi = api;
                pipelineModules.push(qrPipelineModule);
            }

            if (options.watermarkImageUrl) {
                customMediaConfig.watermarkImageUrl = options.watermarkImageUrl;
            }

            pipelineModules.push(
                xr8.XrController.pipelineModule(), // Enables SLAM tracking.
                xr8.GlTextureRenderer.pipelineModule(),
            );

            const ejPlayerModule = ejPlayerPipelineModule();
            pipelineModules.push(ejPlayerModule);

            configureMediaRecorder(customMediaConfig);

            pipelineModules.push(
                xr8.MediaRecorder.pipelineModule(),
                xrExtras.FullWindowCanvas.pipelineModule(), // Modifies the canvas to fill the window.
                xrExtras.Loading.pipelineModule(), // Manages the loading screen on startup.
                xrExtras.RuntimeError.pipelineModule(), // Shows an error image on runtime error.
            );

            xr8.addCameraPipelineModules(pipelineModules);
            ejPlayerModule.emitter.on('setup', ({ player }) => {
                res({
                    player,
                    mediaRecorder: xr8.MediaRecorder,
                    qrProcessApi,
                    ejPlayerModule,
                    audio: sound,
                });
            });

            xr8.run({ canvas });
        });
    });
};
