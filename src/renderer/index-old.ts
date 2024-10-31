// import {
//     Mesh,
//     MeshBasicMaterial,
//     Raycaster,
//     Object3D,
//     Clock,
//     Vector2,
//     Vector3,
//     AxesHelper,
//     TextureLoader,
//     DoubleSide,
//     MathUtils,
//     Euler,
//     PlaneGeometry,
//     Matrix4,
//     Frustum,
//     AudioListener,
//     AudioLoader,
// } from 'three';
// import mitt, { Emitter } from 'mitt';

// import { InitEJ8Options, initPlayerWith8thWall } from './8thwall';
// import { QRProcessEvents } from './8thwall/qr-process-pipeline-module.js';
// import { ARTWORKS, ArtworkId, ArtworkModel } from './artworks';
// import { createContentModule } from './createContentModule.js';
// import { ContentModule, EJPlayerContent } from './libs/ejx.es.js';
// import { TaggedFsm } from '../utils/tagged-fsm.js';
// import { EJPlayerPipelineModuleEvents } from './8thwall/ej-player-pipeline-module.js';
// import FloorSymbol from '../assets/floor_symbol.png';

// import { EJCubeProxy } from './ejx/EJCubeProxy.js';
// import { EJAppImmersiveARControls } from './ejx/EJAppImmersiveARControls.js';
// import { drawWatermark } from './8thwall/watermark.js';

// const XR8_API_KEY = 'u06TvHxx83VwgOPlwINEw6A6kq3xaLgH8bxR7BBLwALZzArISpBnOoJJSmbatLKvkeC14x';
// const VEC2_NDC_CENTRE = new Vector2();
// // Event types for the FSM
// // eslint-disable-next-line @typescript-eslint/no-namespace
// namespace S {
//     export type None = {
//         s: 'None';
//     };
//     export type LoadError = {
//         s: 'LoadError';
//         error: Error;
//     };
//     export type Loading = {
//         s: 'Loading';
//         content: EJPlayerContent;
//         loadProgress: number;
//         artwork: ArtworkModel;
//         contentModule: ContentModule;
//         arControls: EJAppImmersiveARControls;
//     };
//     export type Positioning = {
//         s: 'Positioning';
//         artwork: ArtworkModel;
//         contentModule: ContentModule;
//     };
//     export type Viewing = {
//         s: 'Viewing';
//         content: EJPlayerContent;
//         artwork: ArtworkModel;
//         contentModule: ContentModule;
//         arControls: EJAppImmersiveARControls;
//     };
//     export type All = None | LoadError | Loading | Positioning | Viewing;
// }
// // Event types for the FSM
// // eslint-disable-next-line @typescript-eslint/no-namespace
// namespace E {
//     // Interaciton events
//     export type PointerDown = {
//         e: 'PointerDown';
//         args: [event: PointerEvent];
//     };
//     export type PointerMove = {
//         e: 'PointerMove';
//         args: [event: PointerEvent];
//     };
//     export type PointerUp = {
//         e: 'PointerUp';
//         args: [event: PointerEvent];
//     };

//     export type StartRepositioning = {
//         e: 'StartRepositioning';
//         args: [artwork: ArtworkModel, contentModule: ContentModule];
//     };
//     export type UpdatePositioning = {
//         e: 'UpdatePositioning';
//         args: [position: Vector3];
//     };
//     export type FinishRepositioning = {
//         e: 'FinishRepositioning';
//         args: [position: Vector3];
//     };
//     export type StartLoad = {
//         e: 'StartLoad';
//         args: [artwork: ArtworkModel, contentModule: ContentModule];
//     };
//     export type LoadComplete = {
//         e: 'LoadComplete';
//         args: [];
//     };
//     export type ClearArtwork = {
//         e: 'ClearArtwork';
//         args: [];
//     };
//     export type RepositionCurrent = {
//         e: 'RepositionCurrent';
//         args: [];
//     };
//     export type All =
//         | PointerDown
//         | PointerMove
//         | PointerUp
//         | StartLoad
//         | LoadComplete
//         | StartRepositioning
//         | UpdatePositioning
//         | FinishRepositioning
//         | ClearArtwork
//         | RepositionCurrent;
// }

// /**
//  * Events and API exposed by the renderer
//  */
// export type RendererEvents = {
//     // When the content is loading this will update whenever the load progress changes.
//     'content-load-progress': number;
//     // When the content has finished loading this will be called.
//     'content-loaded': void;
//     // When the position button has been pressed
//     'start-repositioning': void;
//     // When 8thwall registers that recording has started
//     'recording-started': void;
//     // The recording progress, this event occurs every time a frame is captured
//     'recording-progress': { elapsedSeconds: number; totalSeconds: number };
//     // When 8thwall registers that recording has stopped. 8thwall will then begin encoding the vided into a real file.
//     'recording-stopped': void;
//     // When 8th wall has encoded the video it will send out a blob containing the video.
//     'recording-ready': Blob;

//     'content-placed': void;
//     'content-repositioning': void;

//     // Drag events are re-emmitted out from EJAppImmersiveARControls
//     'drag-start': void;
//     'drag-move': void;
//     'drag-stop': void;
//     // Pinch events are re-emmitted out from EJAppImmersiveARControls
//     'pinch-start': void;
//     'pinch-move': void;
//     'pinch-stop': void;

//     'on-artwork-helper-change': 'left' | 'right' | 'none';
// } & QRProcessEvents &
//     EJPlayerPipelineModuleEvents;

// export type RendererApi = {
//     on: Emitter<RendererEvents>['on'];
//     off: Emitter<RendererEvents>['off'];
//     loadArtwork(artworkId: ArtworkId): Promise<void>;
//     clearArtwork(): void;
//     repositionArtwork(artworkId: ArtworkId | undefined): void;
//     startRecording(): void;
//     stopRecording(): void;
//     pause(): void;
//     resume(): void;
//     showReticle(): void;
//     hideReticle(): void;
//     hasBeenRepositioned: boolean;
//     pauseAudio(): void;
//     resumeAudio(): void;
// };

// /**
//  * This sets up the EJPlayer and then wraps it in an API that's more specific to this project.
//  */
export async function initExperienceRenderer(canvas: HTMLCanvasElement, options: InitEJ8Options): Promise<RendererApi> {
//     console.debug('initExperienceRenderer(canvas)', canvas);
//     let pauseRenderer = false;
//     const emitter = mitt<RendererEvents>();
//     const {
//         player: ejPlayer,
//         mediaRecorder,
//         qrProcessApi,
//         ejPlayerModule,
//         audio,
//     } = await initPlayerWith8thWall(canvas, XR8_API_KEY, {
//         ...options,
//         enableQrScanner: true,
//     });

//     // const audio = document.getElementById('ejx-audio') as HTMLAudioElement;

//     /**
//      * This is a magic THREE.js object that positions the content.  The content is
//      * not actually within this object but rather the position is copied across to the real content.
//      */
//     let contentContainer = ejPlayer.contentContainer;
//     if (!contentContainer) {
//         contentContainer = ejPlayer.cubeContainer;
//     }
//     const CONTENT_SCALE = 2;
//     contentContainer.scale.x *= CONTENT_SCALE;
//     contentContainer.scale.y *= CONTENT_SCALE;
//     contentContainer.scale.z *= CONTENT_SCALE;
//     let hasBeenRepositioned = false;

//     // If qr code scanner is avaliable, redirect all the event sback through the main event emitter.
//     if (qrProcessApi) {
//         qrProcessApi.events.on('qr-scan-result', (ev) => emitter.emit('qr-scan-result', ev));
//     }

//     let trackingStatus: string | undefined;

//     ejPlayerModule.emitter.on('trackingStatus', (ev) => {
//         emitter.emit('trackingStatus', ev);
//         trackingStatus = ev;
//     });

//     const cubeProxy = new EJCubeProxy(new Object3D());
//     ejPlayer.scene.add(cubeProxy.container);
//     cubeProxy.opacity = 0;

//     const tempVec3 = new Vector3();
//     const tempEuler = new Euler();

//     const objectWorldPosition = new Vector3();
//     const cameraInverseMatrix = new Matrix4();
//     const frustum = new Frustum();

//     // This is a finite state machine (customised to have properties associated with each state.)
//     // Each transition definition defines how the machine should transition from one state to another.
//     // Even though it's verbose and explicit, if you put all of your state transitions in a FSM it makes it easy to fix
//     // bugs like 'When X is happening and I try to Y it breaks'.
//     const fsm = new TaggedFsm<S.All, E.All>({ s: 'None' })
//         // Start Loading event starts the experience.
//         .defineTransition('None', 'StartRepositioning', (_prev, artwork, contentModule) => {
//             emitter.emit('content-repositioning');
//             hasBeenRepositioned = false;
//             return {
//                 s: 'Positioning',
//                 artwork,
//                 contentModule,
//             };
//         })
//         .defineTransition('Positioning', 'UpdatePositioning', (prev, position) => {
//             // trackingStatus === 'NORMAL' || (trackingStatus === 'LIMITED' && hasBeenRepositioned)
//             //     ? (reticle.visible = true)
//             //     : (reticle.visible = false);
//             hitMarker.position.set(position.x, 0.0, position.z);
//             reticle.position.lerp(new Vector3(position.x, -0.5, position.z), 0.25);
//             contentContainer.position.set(position.x, 1.0, position.z);

//             // Updates hitmarker/content to face camera.
//             const dirToCam = tempVec3;
//             const rotationEuler = tempEuler;
//             dirToCam.copy(ejPlayer.camera.position).sub(contentContainer.position).normalize();
//             const rotationY = Math.atan2(dirToCam.x, dirToCam.z);
//             rotationEuler.set(0, rotationY, 0, 'XYZ');
//             contentContainer.quaternion.setFromEuler(rotationEuler);
//             reticle.quaternion.setFromEuler(rotationEuler);
//             return prev;
//         })
//         .defineTransition('Positioning', 'FinishRepositioning', (prev, position) => {
//             emitter.emit('content-placed');
//             reticle.visible = false;
//             contentContainer.position.set(position.x, 1.0, position.z);
//             // contentContainer.visible = true;
//             const { artwork, contentModule } = prev;
//             // Initialise the spin/scale controls and start loading
//             const { basePath } = artwork;
//             if (ejPlayer.contents.length === 0) {
//                 ejPlayer.setContent({ filename: basePath, module: contentModule });
//             }
//             const content = ejPlayer.contents.find((content) => content.filename === basePath);
//             console.log('content', content);
//             if (!content) {
//                 throw new Error("initExperienceRenderer: setContent(...) on the player but content didn't initialise");
//             }

//             const shared = {
//                 player: ejPlayer,
//                 cubeProxy,
//                 cubeFloorPos: reticle.position,
//             };
//             console.log('start the ar controls')

//             const arControls = new EJAppImmersiveARControls(0, shared);
//             console.log('ar controls', arControls)
//             // ARControls emits (drag|pinch)-(start|move|stop) events.  This just re-emits them so the UI can
//             // handle them.
//             arControls.emitter.on('*', (type: keyof RendererEvents) => emitter.emit(type));
//             arControls.enableDragRotX = true;
//             arControls.enableDragRotY = false;
//             arControls.enablePinchPan = false;
//             arControls.enablePinchScale = true;
//             cubeProxy.loading = true;
//             cubeProxy.loadProgress = 0;

//             return { ...prev, s: 'Loading', content, loadProgress: 0, artwork, contentModule, arControls: arControls };
//         })
//         .defineTransition('Loading', 'LoadComplete', ({ content, artwork, contentModule, arControls }) => {
//             emitter.emit('content-loaded');
//             cubeProxy.loading = false;
//             // contentContainer.visible = true;
//             // TODO add reveal effect here.

//             return { s: 'Viewing', content, artwork, contentModule, arControls };
//         })
//         .defineTransition('Viewing', 'RepositionCurrent', ({ content, artwork, contentModule }) => {
//             // emitter.emit('start-repositioning')
//             emitter.emit('content-repositioning');
//             hasBeenRepositioned = true;

//             return { s: 'Positioning', content, artwork, contentModule };
//         })
//         // Interaction events
//         .defineTransition(['Loading', 'Viewing'], 'PointerDown', (state, event) => {
//             state.arControls.pointerDownHandler(event);
//             return state;
//         })
//         .defineTransition(['Loading', 'Viewing'], 'PointerMove', (state, event) => {
//             state.arControls.pointerMoveHandler(event);
//             return state;
//         })
//         .defineTransition(['Loading', 'Viewing'], 'PointerUp', (state, event) => {
//             state.arControls.pointerUpHandler(event);
//             return state;
//         })

//         // Can only clear artwork if it's loading or viewing.
//         .defineTransition(['Loading', 'Viewing'], 'ClearArtwork', ({ content }) => {
//             if (content) {
//                 ejPlayer.contentKillAll();
//             }
//             oldProgress = 0;
//             ejPlayer.contentKillAll();
//             return { s: 'None' };
//         });

//     // fsm.logTranstions = true;

//     /*
//      * Pass pointer events into the FSM
//      */
//     const canvasEl = document.getElementById('xr-canvas') as HTMLCanvasElement;
//     let activePointers = 0;
//     const handleRawPointerMove = (event: PointerEvent) => {
//         event.preventDefault();
//         event.stopPropagation();
//         if (fsm.can('PointerMove')) {
//             fsm.dispatch('PointerMove', event);
//         }
//     };
//     const handleRawPointerUp = (event: PointerEvent) => {
//         event.preventDefault();
//         event.stopPropagation();
//         if (fsm.can('PointerUp')) {
//             fsm.dispatch('PointerUp', event);
//         }
//         activePointers -= 1;
//         if (activePointers === 0) {
//             document.body.removeEventListener('pointermove', handleRawPointerMove);
//             document.body.removeEventListener('pointerup', handleRawPointerUp);
//         }
//     };

//     canvasEl.addEventListener('pointerdown', (event) => {
//         event.preventDefault();
//         event.stopPropagation();
//         if (fsm.can('PointerDown')) {
//             fsm.dispatch('PointerDown', event);
//         }

//         if (activePointers === 0) {
//             document.body.addEventListener('pointermove', handleRawPointerMove);
//             document.body.addEventListener('pointerup', handleRawPointerUp);
//         }
//         activePointers += 1;
//     });

//     // Track Internal EJPlayer state so that changes can be used in event driven framework like react.
//     let oldProgress = 0;
//     const raycaster = new Raycaster();
//     const reticleTexture = new TextureLoader().load(FloorSymbol);
//     const reticle = new Mesh(
//         new PlaneGeometry(0.75, 0.75).rotateX(-Math.PI / 2),
//         new MeshBasicMaterial({
//             map: reticleTexture,
//             transparent: true,
//             side: DoubleSide,
//             depthTest: false,
//             depthWrite: false,
//         }),
//     );
//     reticle.name = 'Reticle';
//     reticle.visible = false;
//     ejPlayer.scene.add(reticle);

//     const floorPlane = new Mesh(
//         new PlaneGeometry(20, 20, 1, 1),
//         new MeshBasicMaterial({
//             color: 0xffff00,
//             wireframe: true,
//             transparent: true,
//             opacity: 0.5,
//             depthTest: false,
//             depthWrite: false,
//         }),
//     );
//     floorPlane.name = 'FloorPlane';
//     floorPlane.visible = import.meta.env.DEV; // Only show in dev mode.
//     floorPlane.rotateX(-Math.PI / 2);
//     floorPlane.position.set(0, 0, 0);
//     ejPlayer.scene.add(floorPlane);
//     ejPlayer.scene.add(ejPlayer.camera);

//     const hitMarker = new AxesHelper();
//     hitMarker.visible = import.meta.env.DEV; // Only show in dev mode.
//     ejPlayer.scene.add(hitMarker);

//     ejPlayer.camera.position.set(0, 1.5, 0);

//     document.addEventListener('touchstart', () => {
//         if (fsm.value.s === 'Positioning' && reticle.visible) {
//             fsm.dispatch('FinishRepositioning', reticle.position);
//         }
//     });

//     const clock = new Clock(true);

//     ejPlayer.renderOverrideFunc = () => {
//         if (!pauseRenderer) {
//             // console.log('reticle', reticle.position)
//             // Emit when content loads
//             let current = fsm.value;
//             // console.log(current.s);
//             if (current.s === 'Loading') {
//                 const newProgress = ejPlayer.contentLoadProgress();

//                 if (ejPlayer.contentLoaded()) {
//                     emitter.emit('content-load-progress', 1);
//                     current = fsm.dispatch('LoadComplete');
//                     cubeProxy.loadProgress = 1;
//                 } else if (oldProgress !== newProgress) {
//                     oldProgress = newProgress;
//                     emitter.emit('content-load-progress', newProgress);
//                     cubeProxy.loadProgress = newProgress;
//                 }
//             }

//             if (current.s === 'Positioning') {
//                 floorPlane.position.copy(ejPlayer.camera.position);
//                 floorPlane.position.y = 0;

//                 raycaster.setFromCamera(VEC2_NDC_CENTRE, ejPlayer.camera);
//                 const hits = raycaster.intersectObject(floorPlane);
//                 const [first] = hits;
//                 if (hits.length > 0) {
//                     // console.log('hits', hits, first.point);
//                 }
//                 // if (first) console.log(first.point.toArray());
//                 // console.log('floor', floorPlane.position.toArray());
//                 // console.log('camera', ejPlayer.camera.position.toArray());

//                 if (first) {
//                     current = fsm.dispatch('UpdatePositioning', first.point);
//                 }
//             }

//             if (current.s === 'Viewing') {
//                 // arrow + 'artwork this way' implementation
//                 contentContainer.getWorldPosition(objectWorldPosition);
//                 cameraInverseMatrix.copy(ejPlayer.camera.matrixWorld).invert();
//                 cameraInverseMatrix.multiplyMatrices(
//                     ejPlayer.camera.projectionMatrix,
//                     ejPlayer.camera.matrixWorldInverse,
//                 );
//                 frustum.setFromProjectionMatrix(cameraInverseMatrix);

//                 const objectPositionRelativeToCamera = objectWorldPosition.applyMatrix4(cameraInverseMatrix);

//                 const isLeftOfCamera = objectPositionRelativeToCamera.x < 0;
//                 const isOnScreen = frustum.containsPoint(contentContainer.position);
//                 if (!isOnScreen && isLeftOfCamera) {
//                     emitter.emit('on-artwork-helper-change', 'left');
//                 } else if (!isOnScreen && !isLeftOfCamera) {
//                     emitter.emit('on-artwork-helper-change', 'right');
//                 } else {
//                     emitter.emit('on-artwork-helper-change', 'none');
//                 }
//             }

//             const deltaTime = clock.getDelta();
//             const elapsedTime = clock.elapsedTime;
//             if (current.s === 'Loading') {
//                 cubeProxy.timeElapsed = clock.elapsedTime;
//                 cubeProxy.opacity = MathUtils.lerp(cubeProxy.opacity, 0.75, deltaTime * 3);
//             } else {
//                 cubeProxy.opacity = MathUtils.lerp(cubeProxy.opacity, 0, deltaTime * 3);
//             }

//             // TODO Maybe add an update event to FSM and move all this logic in??
//             if (current.s === 'Loading' || current.s === 'Viewing') {
//                 current.arControls.update(elapsedTime, deltaTime);
//             }
//         }
//     };

//     const api: RendererApi = {
//         on: emitter.on,
//         off: emitter.off,
//         /**
//          * Kills previous content and begins to load new content.
//          *
//          * @param artworkId - Artwork to load.
//          */
//         async loadArtwork(artworkId: ArtworkId) {
//             const artworkData = ARTWORKS[artworkId];
//             if (!artworkData) throw new Error(`initExperienceRenderer: loadArtwork(${artworkId}). No artwork found`);

//             if (fsm.can('StartRepositioning')) {
//                 const contentModule = await createContentModule(audio);
//                 fsm.dispatch('StartRepositioning', artworkData, contentModule);
//             } else {
//                 console.log('FSM cannot StartRepositioning from state', fsm.value);
//             }
//             // fix cube disappearing
//             ejPlayer.scene.traverse((object) => {
//                 object.frustumCulled = false;
//             });
//         },
//         clearArtwork() {
//             if (fsm.can('ClearArtwork')) {
//                 fsm.dispatch('ClearArtwork');
//                 // Cleanup
//                 emitter.emit('content-load-progress', oldProgress);
//             }
//         },

//         repositionArtwork(artworkId: ArtworkId) {
//             console.log('reposition', artworkId);
//             // this.loadArtwork(artworkId)
//             if (fsm.can('RepositionCurrent')) fsm.dispatch('RepositionCurrent');
//         },

//         // TODO return a promise
//         startRecording() {
//             mediaRecorder.recordVideo({
//                 onStart() {
//                     emitter.emit('recording-started');
//                 },
//                 onStop() {
//                     emitter.emit('recording-stopped');
//                 },
//                 onProcessFrame(model) {
//                     emitter.emit('recording-progress', {
//                         elapsedSeconds: model.elapsedTimeMs / 1000,
//                         totalSeconds: model.maxRecordingMs / 1000,
//                     });
//                     drawWatermark(model.ctx);
//                 },
//                 onVideoReady(model) {
//                     emitter.emit('recording-ready', model.videoBlob);
//                 },
//             });
//         },
//         stopRecording() {
//             mediaRecorder.stopRecording();
//         },
//         pause() {
//             pauseRenderer = true;
//         },
//         resume() {
//             pauseRenderer = false;
//         },
//         showReticle() {
//             if (fsm.value.s === 'Positioning') reticle.visible = true;
//         },
//         hideReticle() {
//             if (fsm.value.s === 'Positioning') reticle.visible = false;
//         },
//         hasBeenRepositioned: hasBeenRepositioned,
//         pauseAudio() {
//             if (audio) {
//                 console.log('pause audio', audio)
//                 audio.pause();
//                 audio.source = null;
//             }
//         },
//         resumeAudio() {
//             if (audio) {
//                 console.log('play audio', audio)
//                 audio.play();
//             }
//         },
//     };

//     return api;
}
