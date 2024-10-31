// Define an 8th Wall XR Camera Pipeline Module that adds a cube to a threejs scene on startup.
import mitt, { Emitter } from 'mitt';
import { ACESFilmicToneMapping, EquirectangularReflectionMapping } from 'three';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import { I8thWallImageTargetEventModel, IPipelineModule } from '.';

export type MusicCentre3dEvents = {
    'on-show-model': {
        detail: I8thWallImageTargetEventModel['detail'];
    };
    'on-hide-model': {
        detail: I8thWallImageTargetEventModel['detail'];
    };
    'on-update': void;
    'content-load-progress': {
        progress: number;
        total: number;
    };
    'content-loaded': void;
    setup: {
        scene: THREE.Scene;
        camera: THREE.Camera;
    };
    trackingStatus: string;
    'tracking-status': 'show' | 'hide';
    'on-camera-down': boolean;
};

const emitter = mitt<MusicCentre3dEvents>();

export type PlacegroundPipelineModuleResult = IPipelineModule & {
    emitter: Emitter<MusicCentre3dEvents>;
};

export const placegroundPipelineModule =
    (): PlacegroundPipelineModuleResult => {
        const show = () => {
            emitter.emit('tracking-status', 'show');
        };

        const hide = () => {
            emitter.emit('tracking-status', 'hide');
        };

        return {
            name: 'placeground',
            emitter,
            onStart: ({ canvas }) => {
                const { scene, camera, renderer } = XR8.Threejs.xrScene(); // Get the 3js scene from XR8.Threejs

                // Add some light to the scene.
                renderer.physicallyCorrectLights = true;
                renderer.toneMapping = ACESFilmicToneMapping;
                renderer.toneMappingExposure = 1;

                new RGBELoader().load(
                    '/empty_warehouse_01_1k.hdr',
                    function (texture) {
                        texture.mapping = EquirectangularReflectionMapping;

                        scene.environment = texture;
                    },
                );

                camera.position.set(0, 2, 2);

                emitter.emit('setup', { scene, camera });

                canvas.addEventListener('touchmove', (event) => {
                    event.preventDefault();
                });

                XR8.XrController.updateCameraProjectionMatrix({
                    origin: camera.position,
                    facing: camera.quaternion,
                });
            },
            onUpdate: () => {
                emitter.emit('on-update');
            },
            onException: (error) => {
                console.log('3d pipeline module error', error);
            },
            listeners: [
                { event: 'coaching-overlay.show', process: show },
                { event: 'coaching-overlay.hide', process: hide },
            ],
        };
    };
