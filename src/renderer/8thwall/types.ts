/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scene, Camera, WebGLRenderer, Texture } from 'three';

export interface I8thWallPipelineModuleListener {
    event:
        | 'reality.imageloading'
        | 'reality.imageupdated'
        | 'reality.imagelost'
        | 'reality.imagescanning'
        | 'reality.imagefound';
    process: (arg: any) => void;
}

// Generics
interface Vec3 {
    x: number;
    y: number;
    z: number;
}

interface Quaternion extends Vec3 {
    w: number;
}

interface IImageTarget {
    imagePath: string;
    metadata: Record<string, unknown>;
    name: string;
}

// Type definitons for builtin models
export namespace Models {
    export interface AppResourcesModel {
        framework: unknown;
        imageTargets: IImageTarget[];
        version: string;
    }

    export interface CanvasChangeModel {
        GLctx: WebGLRenderingContext;
        computeCtx: WebGLRenderingContext;
        videoWidth: number;
        videoHeight: number;
        canvasWidth: number;
        canvasHeight: number;
    }

    export interface VideoChangeModel extends CanvasChangeModel {
        orientation: -90 | 0 | 90 | 180;
    }

    export interface StartModel extends VideoChangeModel {
        canvas: HTMLCanvasElement;
        isWebgl2: boolean;
        config: unknown;
    }

    export interface CameraStatusChangeModel {
        status: 'requesting' | 'hasStream' | 'hasVideo' | 'failed';
        stream?: MediaStream;
        video?: HTMLVideoElement;
        config: unknown;
    }

    export interface AttachModel extends StartModel, CameraStatusChangeModel {}

    export interface DetachModel {
        framework: unknown;
    }

    export interface FrameStartModel {
        framework: {
            dispatchEvent: (eventName: string, detail: unknown) => void;
        };
        frameStartResult: {
            cameraTexture: WebGLTexture;
            computeTexture: WebGLTexture;
            GLctx: WebGLRenderingContext;
            computeCtx: WebGLRenderingContext;
            textureWidth: number;
            textureHeight: number;
            orientation: -90 | 0 | 90 | 180;
            videoTime: string | number;
            repeatFrame: boolean;
        };
    }

    export interface ProcessGPUModel {
        processGpuResult: {
            camerapixelarray: {
                pixels: Uint8Array;
                rows: number;
                cols: number;
            };
        };
    }
}

export interface I8thWallImageTargetEventModel {
    /* event name i.e. "reality.imageupdated" */ name: 'reality.imagelost' | 'reality.imageupdated';
    detail: {
        metadata: any | null;
        /* name of image target in 8thwall */ name: string;
        position: Vec3;
        rotation: Quaternion;
        scale: number;
        scaledHeight: number;
        scaledWidth: number;
        type: string;
    };
}

export interface I8thWallOnStartModel {
    GLctx: WebGL2RenderingContext;
    canvas: HTMLCanvasElement;
    canvasWidth: number;
    canvasHeight: number;
    config: {
        allowedDevices: any[] | null;
        cameraConfig: any;
        glContextConfig: any;
        ownRunLoop: boolean;
        webgl2: boolean;
    };
    isWebgl2: boolean;
    video: HTMLVideoElement;
    orientation: number;
    rotation: number;
    videoHeight: number;
    videoWidth: number;
}

export interface I8thWallOnUpdateModel {
    GLctx: WebGL2RenderingContext;
    cameraTexture: WebGLTexture;
    fps: number;
    heapDataReadyResult: {
        reality: {
            detectedImages: any[];
            position: Vec3;
            rotation: Quaternion;
            intrinsics: number[];
        };
    };
    frameStartResult: {
        cameraTexture: WebGLTexture;
        computeTexture: WebGLTexture;
        GLctx: WebGL2RenderingContext;
        computeCtx: WebGL2RenderingContext;
        textureWidth: number;
        textureHeight: number;
        orientation: number;
        videoTime: number;
        repeatFrame: boolean;
    };
    processGpuResult: {
        camerapixelarray: {
            pixels: Uint8Array;
            rows: number;
            cols: number;
        };
    };
    processCpuResult: {
        facecontroller: any;
        reality: {
            trackingStatus: string;
            detectedImages: any[];
            position: Vec3;
            rotation: Quaternion;
            intrinsics: number[];
        };
    };
}

export interface I8thWallOnCanvasResize {
    canvasWidth: number;
    canvasHeight: number;
    videoWidth: number;
    videoHeight: number;
}
export interface I8thWallOnOrientationResize {
    videoWidth: number;
    videoHeight: number;
    orientation: number;
}

export interface IPipelineModuleModel {}

export interface IPipelineModule {
    name: string;
    onAppResourcesLoaded?: (model: Models.AppResourcesModel) => void;
    onAttach?: (model: unknown) => void;
    onStart?: (model: Models.StartModel) => void;
    onUpdate?: (model: I8thWallOnUpdateModel) => void;
    onCanvasSizeChange?: (model: I8thWallOnCanvasResize) => void;
    onDeviceOrientationChange?: (model: I8thWallOnOrientationResize) => void;
    onRender?: (model: I8thWallOnUpdateModel) => void;
    onProcessCpu?: (model: I8thWallOnUpdateModel) => void;
    onProcessGpu?: (model: I8thWallOnUpdateModel) => void;
}

// XR8.CanvasScreenshot
type CanvasScreenshotConfigureProps = {
    maxDimension: number;
    jpgCompression: number;
};
interface ICanvasScreenshot {
    configure: (props: Partial<CanvasScreenshotConfigureProps>) => void;
    takeScreenshot: () => Promise<string>;
    pipelineModule: () => IPipelineModule;
    // Sets a foreground canvas to be displayed on top of the camera canvas. This must be the same dimensions as the camera canvas.
    // Only required if you use separate canvases for camera feed vs virtual objects.
    setForegroundCanvas: (canvas: HTMLCanvasElement) => void;
}

// XR8.GlTextureRenderer
type GlTextureRendererConfigProps = {
    vertexSource: string;
    fragmentSource: string;
    toTexture: boolean;
    flipY: boolean;
    mirroredDisplay: boolean;
};
type GlTextureRendererCreateProps = Partial<GlTextureRendererConfigProps> & {
    GLctx: WebGLRenderingContext;
    toTexture?: WebGLTexture;
};
type ViewportProps = {
    width: number;
    height: number;
    offsetX?: number;
    offsetY?: number;
};
type GlTextureRendererCreateReturn = {
    render: { renderTexture: WebGLTexture; viewport: ViewportProps };
    destroy: () => void;
    shader: () => WebGLShader;
};

interface IGlTextureRenderer {
    configure: (props: GlTextureRendererConfigProps) => void;
    create: (props: GlTextureRendererCreateProps) => GlTextureRendererCreateReturn;
    fillTextureViewport: () => ViewportProps;
    pipelineModule: () => IPipelineModule;
}
// XR8.CameraPixelArray
type CameraPixelArrayProps = {
    // Output grayscale rather than RGBA
    luminance: boolean;
    // Size of pixels in longest dimension, maintaining aspect ration
    maxDimension: number;
    // Overrides maxDimension,
    width: number;
    // Overrides maxDimension,
    height: number;
};
interface ICameraPixelArray {
    pipelineModule: (props?: Partial<CameraPixelArrayProps>) => IPipelineModule;
}

// XR8.MediaRecorder
export type MediaRecorderProps = {
    coverImageUrl: string;
    enableEndCard: boolean;
    endCardCallToAction: string;
    footerImageUrl: null | string;
    foregroundCanvas: null | HTMLCanvasElement;
    maxDurationMs: number;
    maxDimension: number;
    shortLink: string;
    configureAudioOutput: (props: unknown) => void;
    // Set threejs audio context here.
    audioContext: AudioContext | null;
    requestMic: 'auto' | 'manual';
    watermarkImageUrl?: string;
    watermarkMaxWidth?: number;
    watermarkMaxHeight?: number;
    watermarkLocation?: string;
};
type RecordVideoProps = {
    onError: (props: unknown) => void;
    onProcessFrame: (props: { elapsedTimeMs: number; maxRecordingMs: number; ctx?: any }) => void;
    onStart: (props: unknown) => void;
    onStop: (props: unknown) => void;
    onPreviewReady: (props: unknown) => void;
    onFinalizeProgress: (props: { progress: number; total: number }) => void;
    onVideoReady: (props: { videoBlob: Blob }) => void;
};
export interface IMediaRecorder {
    configure: (props: Partial<MediaRecorderProps>) => void;
    pipelineModule: () => IPipelineModule;
    recordVideo: (props: Partial<RecordVideoProps>) => void;
    stopRecording: () => void;
    requestMicrophone: () => Promise<void>;
}

// XR8.ThreeJs
interface IThreeJs {
    pipelineModule: () => IPipelineModule;
    xrScene: () => {
        scene: Scene;
        camera: Camera;
        renderer: WebGLRenderer;
        cameraTexture: Texture;
    };
}
/*
 * XR8.MediaRecorder
 */

// XR8.XrController()
type ConfigureProps = {
    enableLighting: boolean;
    enableWorldPoints: boolean;
    disableWorldTracking: boolean;
    imageTargets: string[];
    leftHandedAxes: boolean;
    mirroredDisplay: boolean;
    scale: 'responsive' | 'absolute';
};
type Intersection = {
    type: 'FEATURE_POINT' | 'ESTIMATED_SURFACE' | 'DETECTED_SURFACE' | 'UNSPECIFIED';
    position: Vec3;
    rotation: Quaternion;
    distance: number;
};
type CameraProps = {
    pixelRectWidth: number;
    pixelRectHeight: number;
    nearClipPlane: number;
    farClipPlane: number;
};
interface IXrController {
    configure: (config: Partial<ConfigureProps>) => void;
    /**
     * Estimate the 3D position of a point on the camera feed. X and Y are specified
     * as numbers between 0 and 1, where (0, 0) is the upper left corner and (1, 1) is
     * the lower right corner of the camera feed as rendered in the camera that was
     * specified by updateCameraProjectionMatrix. Mutltiple 3d position estimates may
     * be returned for a single hit test based on the source of data being used to
     * estimate the position. The data source that was used to estimate the position
     * is indicated by the hitTest.type.
     */
    hitTest: (x: number, y: number, includedTypes: ['FEATURE_POINT']) => Intersection[];
    pipelineModule: () => IPipelineModule;
    recenter: () => void;
    updateCameraProjectionMatrix: {
        cam?: CameraProps;
        origin?: Vec3;
        facing?: Quaternion;
    };
}

// XR8.XrDevice()
interface IDeviceEstimateResult {
    os: string;
}
enum IncompatibilityReasons {
    UNSPECIFIED = 0,
    UNSUPPORTED_OS = 1,
    UNSUPPORTED_BROWSER = 2,
    MISSING_DEVICE_ORIENTATION = 3,
    MISSING_USER_MEDIA = 4,
    MISSING_WEB_ASSEMBLY = 5,
}
interface IXrDevice {
    deviceEstimate: () => IDeviceEstimateResult;
    incompatibleReasons: () => IncompatibilityReasons;
    incompatibleReasonDetails: () => unknown;
    isDeviceBrowserCompatible: () => boolean;
}

type Xr8RunConfig = {
    canvas: HTMLCanvasElement;
};

export interface IXR8 {
    GlTextureRenderer: IGlTextureRenderer;
    Threejs: IThreeJs;
    XrController: IXrController;
    MediaRecorder: IMediaRecorder;
    CanvasScreenshot: ICanvasScreenshot;
    CameraPixelArray: ICameraPixelArray;
    XrDevice: IXrDevice;

    run: (config: Xr8RunConfig) => void;

    addCameraPipelineModules: (modules: IPipelineModule[]) => void;
    addCameraPipelineModule: (module: IPipelineModule) => void;

    pause: () => void;
    resume: () => void;
}

interface ILoading {
    pipelineModule: () => IPipelineModule;
    showLoading: (props: { onxrloaded: () => void; onxrerror: (reason: unknown) => void }) => void;
}

export interface IXRExtras {
    AlmostThere: { pipelineModule: () => IPipelineModule };
    FullWindowCanvas: { pipelineModule: () => IPipelineModule };
    Loading: ILoading;
    RuntimeError: { pipelineModule: () => IPipelineModule };
}

declare global {
    interface Window {
        isLocal?: boolean;
        XR8?: IXR8;
        XRExtras?: IXRExtras;
    }
}
