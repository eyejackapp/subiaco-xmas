
import {
    IMediaRecorder,
    IPipelineModule,
    IXR8,
    IXRExtras,
    MediaRecorderProps,
} from './types';
// import { Scene, AudioContext, Audio } from "three";
import * as THREE from 'three';
import { configure } from './capture-config';
import {
    PlacegroundPipelineModuleResult,
    placegroundPipelineModule,
} from './placeground-pipeline-module';
import {
    ExperienceType,
    experienceStore,
    experienceTypeAtom,
} from '../../atoms';
import { artworkData } from '../artworks';
export * from './types';
/**
 * Loads a script from a CDN by putting it in a <script> tag
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
        const head = document.getElementsByTagName(
            'head',
        )[0] as HTMLHeadElement;
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
const init = (
    key: string,
    config: (xr8: IXR8, xrExtras: IXRExtras) => void,
): Promise<void> => {
    return new Promise((res, rej) => {
        const dependencies = [
            loadScript('https://cdn.8thwall.com/web/xrextras/xrextras.js'),
            loadScript(
                'https://cdn.8thwall.com/web/coaching-overlay/coaching-overlay.js',
            ),
            loadScript(`https://apps.8thwall.com/xrweb?appKey=${key}`),
        ];

        const showLoading = () => {
            if (!window.XRExtras) {
                setTimeout(() => showLoading(), 20);
            } else {
                window.XRExtras.Loading.showLoading({
                    onxrloaded: () => {
                        config(
                            window.XR8 as unknown as IXR8,
                            window.XRExtras as IXRExtras,
                        );
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
            window.XRExtras
                ? showLoading()
                : window.addEventListener('xrextrasloaded', showLoading);
        });
    });
};

type EJ8Api = {
    mediaRecorder: IMediaRecorder;
    module:
         PlacegroundPipelineModuleResult;
    scene: THREE.Scene;
    camera: THREE.Camera;
    audio: THREE.Audio;
};

let listener: THREE.AudioListener;
let sound: THREE.Audio<GainNode>;
const customMediaConfig = {
    watermarkImageUrl: '',
};

const configureMediaRecorder = ({
    watermarkImageUrl,
}: Partial<MediaRecorderProps>) => {
    listener = new THREE.AudioListener();
    sound = new THREE.Audio(listener);

    const audioConfig = ({ microphoneInput, audioProcessor }: any) => {
        const audioContext = audioProcessor.context;
        listener.gain.connect(audioProcessor);
        listener.gain.connect(audioContext.destination);
        return microphoneInput;
    };

    const customMediaConfig = {
        configureAudioOutput: audioConfig,
        audioContext: THREE.AudioContext.getContext(),
        watermarkImageUrl: watermarkImageUrl,
        watermarkMaxWidth: 45,
        watermarkLocation: 'bottomMiddle',
        requestMic: 'manual' as 'manual' | 'auto',
    };

    configure(customMediaConfig);
};

export const init8thWall = (
    canvas: HTMLCanvasElement,
    key: string,
    options: Partial<MediaRecorderProps>,
) => {
    return new Promise<EJ8Api>((res) => {
        init(key, (xr8, xrExtras) => {
            xr8.XrController.configure({
                disableWorldTracking: false,
                scale: 'absolute',
            });
            const pipelineModules: IPipelineModule[] = [];

            pipelineModules.push(
                xr8.XrController.pipelineModule(), // Enables SLAM tracking.
                xr8.GlTextureRenderer.pipelineModule(),
                xr8.Threejs.pipelineModule(),
            );

            const placegroundModule: PlacegroundPipelineModuleResult =
                placegroundPipelineModule();
            pipelineModules.push(placegroundModule);

            if (options.watermarkImageUrl) {
                customMediaConfig.watermarkImageUrl = options.watermarkImageUrl;
            }

            configureMediaRecorder(customMediaConfig);

            pipelineModules.push(
                xr8.MediaRecorder.pipelineModule(),
                xrExtras.FullWindowCanvas.pipelineModule(), // Modifies the canvas to fill the window.
                xrExtras.Loading.pipelineModule(), // Manages the loading screen on startup.
                xrExtras.RuntimeError.pipelineModule(), // Shows an error image on runtime error.
                window.CoachingOverlay.pipelineModule(), // Show the absolute scale coaching overlay.
            );
            window.CoachingOverlay.configure({ disablePrompt: true });

            xr8.addCameraPipelineModules(pipelineModules);

            placegroundModule.emitter.on('setup', ({ scene, camera }) => {
                res({
                    mediaRecorder: xr8.MediaRecorder,
                    module: placegroundModule,
                    scene,
                    camera,
                    audio: sound,
                });
            });
            xr8.run({ canvas });
        });
    });
};
