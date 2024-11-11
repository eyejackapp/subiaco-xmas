import { PlacegroundPipelineModuleResult } from "./8thwall/placeground-pipeline-module";
import {
  Audio,
  AnimationClip,
  AnimationMixer,
  Camera,
  Group,
  Object3DEventMap,
  Scene,
  Vector3,
  LoopOnce,
  LoopRepeat,
  Raycaster,
  Vector2,
  PlaneGeometry,
  ShadowMaterial,
} from "three";
import { Mesh, Object3D, Clock } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { ArtworkModel, ARTWORKS } from "./artworks";
export type I3dPipeline = {
  loadArtwork: (artworkData: ArtworkModel) => Promise<Group<Object3DEventMap>>;
};
export function init3dExperience(
  module: PlacegroundPipelineModuleResult,
  scene: Scene,
  _camera: Camera,
  audio: Audio
) {
  let mixer: AnimationMixer;
  let model: any;

  const clock = new Clock(true);
  const raycaster = new Raycaster();
  const tapPosition = new Vector2();

  const surface = new Mesh(
    new PlaneGeometry(100, 100, 1, 1),
    new ShadowMaterial({
      opacity: 0.5,
    })
  );

  surface.rotateX(-Math.PI / 2);
  surface.position.set(0, 0, 0);
  surface.receiveShadow = true;
  scene.add(surface);

  module.emitter.on("place-object", (e) => {
      tapPosition.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      tapPosition.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(tapPosition, _camera);

      const intersects = raycaster.intersectObject(surface);

      if (intersects.length === 1 && intersects[0].object === surface) {
        if (!model.scene.children[0]) return;
        model.scene.children[0].position.set(intersects[0].point.x, 0, intersects[0].point.z);
      }
  });

  // const audioElement = document.getElementById(
  //     'ejx-audio',
  // ) as HTMLAudioElement;
  // audio.setMediaElementSource(audioElement);

  const cameraWorldDirection = new Vector3();

  const loadArtwork = async (artworkData: ArtworkModel) => {
    const loader = new GLTFLoader();
    model = await loader.loadAsync(artworkData.basePath, (progress) => {
      module.emitter.emit("content-load-progress", {
        progress: progress.loaded,
        total: progress.total,
      });
    });

    model.scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        child.frustumCulled = false;
      }
    });

    // animate the model
    mixer = new AnimationMixer(model.scene);
    model.animations.forEach((clip: AnimationClip) => {
      const action = mixer.clipAction(clip.optimize());
      action.setLoop(LoopOnce);
      action.clampWhenFinished = true;
      action.play();
    });

    let hasShownUnlockedModal = false;
    mixer.addEventListener("finished", (event) => {
      if (hasShownUnlockedModal) return;
      module.emitter.emit("on-animation-loop");
      hasShownUnlockedModal = true;
      playAnimationsRepeat(model);
    });

    scene.traverse((object) => {
      object.frustumCulled = false;
    });
    module.emitter.emit("content-loaded");
    // model.scene.scale.set(0.001, 0.001, 0.001);
    model.scene.scale.set(0.8, 0.8, 0.8);

    // const soundFile = model.parser.json.scenes[0].extras;

    model.scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        child.frustumCulled = false;
      }
    });

    // audioElement.src = soundFile.sound_file_64;
    // audioElement.load();
    // audioElement.oncanplay = () => {
    //     audioElement.play();

    XR8.XrController.recenter();
    contentContainer.add(model.scene);
    // };

    return model.scene;
  };

  const playAnimationsRepeat = (model) => {
    model.animations.forEach((clip: AnimationClip) => {
      const action = mixer.clipAction(clip.optimize());
      action.stop();
      action.setLoop(LoopRepeat);
      action.play();
    });
  };

  const contentContainer = new Object3D();
  scene.add(contentContainer);

  module.emitter.on("on-update", () => {
    if (!mixer) {
      return;
    }
    _camera.getWorldDirection(cameraWorldDirection);

    const isCameraFaceDown = cameraWorldDirection.y < -0.55;
    module.emitter.emit("on-camera-down", isCameraFaceDown);

    const delta = clock.getDelta();
    mixer.update(delta);
  });

  return { loadArtwork };
}
