import { PerspectiveCamera, Quaternion, Scene } from 'three';
import { IPipelineModule } from '.';
import { EJPlayerBase, EJPlayerCubeOne, EJWebGLRenderer } from '../libs/ejx.es.js';
import mitt, { Emitter } from 'mitt';

export type EJPlayerPipelineModuleEvents = {
    setup: {
        player: EJPlayerBase;
    };
    resized: {
        width: number;
        height: number;
        dpi: number;
    };
    trackingStatus: string;
};

export type EJPlayerPipelineModuleResult = IPipelineModule & {
    emitter: Emitter<EJPlayerPipelineModuleEvents>;
};

export const ejPlayerPipelineModule = (): EJPlayerPipelineModuleResult => {
    let player: EJPlayerBase | undefined;
    const emitter = mitt<EJPlayerPipelineModuleEvents>();
    let allowCanvasResize = true;
    let updatedCanvasWidth = 0;
    let updatedCanvasHeight = 0;
    return {
        name: 'ej-player',
        emitter,
        onStart: ({ canvas, GLctx }) => {
            const scene = new Scene();
            const camera = new PerspectiveCamera();
            camera.position.set(0, 1.5, 0);

            const renderer = new EJWebGLRenderer({
                canvas,
                context: GLctx,
            });
            renderer.autoClear = false;
            // Sync the xr controller's 6DoF position and camera paremeters with our scene.
            XR8.XrController.updateCameraProjectionMatrix({
                origin: camera.position,
                facing: camera.quaternion,
            });

            player = new EJPlayerCubeOne({
                canvas,
                camera,
                renderer,
                scene,
            });
            if (player) {
                if (player.controls) {
                    player.controls.dispose(); // remove any existing controls.
                    player.controls = null;
                }
                if (player.orbitControls) {
                    player.orbitControls.dispose(); // remove any existing orbit controls.
                    player.orbitControls = null;
                }

                emitter.emit('setup', { player });
            }
        },
        onUpdate: ({ processCpuResult }) => {
            if (!player) {
                console.warn('ejPlayerPipelineModule: onUpdate but no `player` to update.');
                return;
            }
            if (processCpuResult && processCpuResult.reality && processCpuResult.reality.trackingStatus) {
                emitter.emit('trackingStatus', processCpuResult.reality.trackingStatus);
            }
            const realitySource = processCpuResult.reality || processCpuResult.facecontroller;

            if (!realitySource) {
                return;
            }

            const { rotation, position, intrinsics } = realitySource;
            const { camera } = player;

            for (let i = 0; i < 16; i++) {
                camera.projectionMatrix.elements[i] = intrinsics[i];
            }

            // Fix for broken raycasting in r103 and higher. Related to:
            //   https://github.com/mrdoob/three.js/pull/15996
            // Note: camera.projectionMatrixInverse wasn't introduced until r96 so check before setting
            // the inverse
            if (camera.projectionMatrixInverse) {
                camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
            }

            if (rotation) {
                camera.setRotationFromQuaternion(rotation as Quaternion);
            }
            if (position) {
                camera.position.set(position.x, position.y, position.z);
            }
            camera.updateMatrix();
            camera.updateMatrixWorld();
        },
        onCanvasSizeChange: ({ GLctx, computeCtx, videoWidth, videoHeight, canvasWidth, canvasHeight }) => {
            if (!player) {
                console.warn('ejPlayerPipelineModule: onCanvasSizeChange but no `player` to update.');
                return;
            }

            const devicePixelRatio = 1;
            const updateCameraAndRenderer = true;

            // temp hacky fix for the canvas resize breaking after an orientation change
            if (allowCanvasResize) {
                updatedCanvasWidth = canvasWidth;
                updatedCanvasHeight = canvasHeight;
            }
            player.resize(updatedCanvasWidth, updatedCanvasHeight, devicePixelRatio, updateCameraAndRenderer);
            emitter.emit('resized', {
                width: canvasWidth,
                height: canvasHeight,
                dpi: devicePixelRatio,
            });
            allowCanvasResize = true;
        },
        onDeviceOrientationChange: () => {
            allowCanvasResize = false;
        },
        onRender: () => {
            if (!player) {
                console.warn('ejPlayerPipelineModule: onRender but no `player` to update.');
                return;
            }

            player.render();
            player.renderer.clearDepth();
        },
    };
};
