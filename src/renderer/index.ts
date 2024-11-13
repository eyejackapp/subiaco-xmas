import mitt, { Emitter } from "mitt";
import { I8thWallImageTargetEventModel, init8thWall } from "./8thwall";
import { drawWatermark } from "./8thwall/watermark";

import { init3dExperience } from "./placeground";
import {
  PlaceGround3dEvents,
  PlacegroundPipelineModuleResult,
} from "./8thwall/placeground-pipeline-module";
import { Scene } from "three";
import { ArtworkId, ARTWORKS } from "./artworks";
import { QRProcessEvents } from "./8thwall/qr-process-pipeline-module";

const XR8_API_KEY =
  "mw1uy5jVtZZO85pE4KP2QUdffHKjnFlnitMtFzTNu3MYagu9rxduWbFtM7czPhauEmNe8a";

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
  "tracking-status": "show" | "hide";
  "on-animation-loop": void;
} & PlaceGround3dEvents &
  QRProcessEvents;

export type RendererApi = {
  on: Emitter<RendererEvents>["on"];
  off: Emitter<RendererEvents>["off"];
  loadArtwork(id: string): any;
  startRecording(): void;
  stopRecording(): void;
  pauseTracking(): void;
  resumeTracking(): void;
  pauseAudio(): void;
  resumeAudio(): void;
  getScene(): Scene;
};

type RendererOptions = {
  watermarkImageUrl: string;
};

/**
 * This sets up 8thwall and placeground module and then wraps it in an API that's more specific to this project.
 */
export async function initExperienceRenderer(
  canvas: HTMLCanvasElement,
  options: RendererOptions
): Promise<RendererApi> {
  console.debug("initExperienceRenderer(canvas)", canvas);
  const emitter = mitt<RendererEvents>();
  const { mediaRecorder, module, scene, audio, qrProcessApi, camera } =
    await init8thWall(canvas, XR8_API_KEY, {
      ...options,
      enableQrScanner: true,
    });
  const module3d = init3dExperience(
    module as PlacegroundPipelineModuleResult,
    scene,
    camera,
    audio
  );
  const moduleEmitter = module.emitter as Emitter<PlaceGround3dEvents>;

  moduleEmitter.on("tracking-status", (status: "show" | "hide") => {
    emitter.emit("tracking-status", status);
  });
  moduleEmitter.on("on-animation-loop", () =>
    emitter.emit("on-animation-loop")
  );
  moduleEmitter.on("content-loaded", () => {
    emitter.emit("content-loaded");
  });
  moduleEmitter.on("content-load-progress", ({ progress, total }) => {
    emitter.emit("content-load-progress", { progress, total });
  });
  moduleEmitter.on("on-camera-down", (isCameraFaceDown) => {
    emitter.emit("on-camera-down", isCameraFaceDown);
  });
  if (qrProcessApi) {
    qrProcessApi.events.on("qr-scan-result", (ev) =>
      emitter.emit("qr-scan-result", ev)
    );
  }

  const api: RendererApi = {
    on: emitter.on,
    off: emitter.off,
    /**
     *
     * @param artworkId - Artwork to load.
     */
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
    getScene() {
      return scene;
    },
    async loadArtwork(artworkId: ArtworkId) {
      const artworkData = ARTWORKS[artworkId];
      if (!artworkData)
        throw new Error(
          `initExperienceRenderer: loadArtwork(${artworkId}). No artwork found`
        );
      const model = await module3d.loadArtwork(artworkData);
      return model;
    },
    pauseTracking() {
      this.pauseAudio()
      moduleEmitter.emit("pause-tracking");
    },
    resumeTracking() {
      this.resumeAudio()
      moduleEmitter.emit("resume-tracking");
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
