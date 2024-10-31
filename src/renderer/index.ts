import mitt, { Emitter } from "mitt";
import { I8thWallImageTargetEventModel, init8thWall } from "./8thwall";
import { drawWatermark } from "./8thwall/watermark";

import { I3dPipeline, init3dExperience } from "./placeground";
import {
  MusicCentre3dEvents,
  PlacegroundPipelineModuleResult,
} from "./8thwall/placeground-pipeline-module";
import { Group, Object3DEventMap } from "three";

const XR8_API_KEY =
  "c2sSoNQnvsUVgBjx5aRT8E8hJDeHZXz2eNd93ewmqVyGe534KPimsQ2Sx85vqqF32Vh7eB";

/**
 * Events and API exposed by the renderer
 */
export type RendererEvents = {
  // When the content is loading this will update whenever the load progress changes.
  "content-load-progress": {
    progress: number;
    total: number;
  };
  // When the content has finished loading this will be called.
  "content-loaded": void;
  // When 8thwall registers that recording has started
  "recording-started": void;
  // The recording progress, this event occurs every time a frame is captured
  "recording-progress": { elapsedSeconds: number; totalSeconds: number };
  // When 8thwall registers that recording has stopped. 8thwall will then begin encoding the vided into a real file.
  "recording-stopped": void;
  // When 8th wall has encoded the video it will send out a blob containing the video.
  "recording-ready": Blob;

  "on-show-target": void;
  "on-hide-target": void;
  "on-update-target": (ev: I8thWallImageTargetEventModel) => void;
  "on-targets-scanned": (ev: I8thWallImageTargetEventModel) => void;

  "resume-tracking": void;
  "pause-tracking": void;
  "on-camera-down": boolean;
} & MusicCentre3dEvents;

export type RendererApi = {
  on: Emitter<RendererEvents>["on"];
  off: Emitter<RendererEvents>["off"];
  loadArtwork(): Promise<Group<Object3DEventMap>>;
  startRecording(): void;
  stopRecording(): void;
  pauseTracking(): void;
  resumeTracking(): void;
  pauseAudio(): void;
  resumeAudio(): void;
};

type RendererOptions = {
  watermarkImageUrl: string;
};

/**
 * This sets up 8thwall and music centre modules and then wraps it in an API that's more specific to this project.
 */
export async function initExperienceRenderer(
  canvas: HTMLCanvasElement,
  options: RendererOptions
): Promise<RendererApi> {
  console.debug("initExperienceRenderer(canvas)", canvas);
  const emitter = mitt<RendererEvents>();
  const { mediaRecorder, module, scene, audio, camera } = await init8thWall(
    canvas,
    XR8_API_KEY,
    options
  );
  let module3d: I3dPipeline;
  module3d = init3dExperience(
    module as PlacegroundPipelineModuleResult,
    scene,
    camera,
    audio
  );
  const moduleEmitter = module.emitter as Emitter<MusicCentre3dEvents>;

  moduleEmitter.on("tracking-status", (status) => {
    emitter.emit("tracking-status", status);
  });
  moduleEmitter.on("content-loaded", () => {
    emitter.emit("content-loaded");
  });
  moduleEmitter.on("content-load-progress", ({ progress, total }) => {
    emitter.emit("content-load-progress", { progress, total });
  });
  moduleEmitter.on("on-camera-down", (isCameraFaceDown) => {
    emitter.emit("on-camera-down", isCameraFaceDown);
  });

  const api: RendererApi = {
    on: emitter.on,
    off: emitter.off,
    /**
     * Kills previous content and begins to load new content.
     *
     * @param artworkId - Artwork to load.
     */
    pauseTracking() {
      emitter.emit("pause-tracking");
    },
    resumeTracking() {
      emitter.emit("resume-tracking");
    },
    pauseAudio() {
      if (audio) {
        audio.context.suspend();
      }
    },
    resumeAudio() {
      if (audio) {
        audio.context.resume();
      }
    },
    async loadArtwork() {
      const model = await module3d.loadArtwork();
      return model;
    },

    // TODO return a promise
    startRecording() {
      mediaRecorder.recordVideo({
        onStart() {
          emitter.emit("recording-started");
        },
        onStop() {
          emitter.emit("recording-stopped");
        },
        onProcessFrame(model) {
          emitter.emit("recording-progress", {
            elapsedSeconds: model.elapsedTimeMs / 1000,
            totalSeconds: model.maxRecordingMs / 1000,
          });
          drawWatermark(model.ctx);
        },
        onVideoReady(model) {
          emitter.emit("recording-ready", model.videoBlob);
        },
      });
    },
    stopRecording() {
      mediaRecorder.stopRecording();
    },
  };

  return api;
}
