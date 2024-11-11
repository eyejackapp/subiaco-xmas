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
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  DoubleSide,
  MeshBasicMaterial,
  RingGeometry,
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
  let pauseRender = true;

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

  const contentContainer = new Object3D();
  scene.add(contentContainer);

  const reticle = new Mesh(
    new RingGeometry(0.1, 0.2, 32),
    new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      side: DoubleSide,
      depthTest: false,
      depthWrite: false,
    })
  );
  reticle.rotation.x = -Math.PI / 2;
  reticle.position.set(0, 0, -1);
  reticle.name = "Reticle";
  reticle.visible = false;
  scene.add(reticle);

module.emitter.on("place-object", (e) => {
  tapPosition.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
  tapPosition.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(tapPosition, _camera);

  const intersects = raycaster.intersectObject(surface);

  if (intersects.length === 1 && intersects[0].object === surface) {
    if (!model.scene.children[0]) return;
    reticle.visible = true;
    reticle.position.copy(intersects[0].point);
    model.scene.children[0].position.set(
      intersects[0].point.x,
      0,
      intersects[0].point.z
    );
  } else {
    reticle.visible = false;
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

    module.emitter.emit("content-loaded");

    model.scene.scale.set(0.8, 0.8, 0.8);

    // const soundFile = model.parser.json.scenes[0].extras;

    model.scene.traverse((child: Object3D) => {
      if ((child as Mesh).isMesh) {
        child.frustumCulled = false;
        const mesh = child as Mesh;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((material) => {
              if (
                material instanceof MeshStandardMaterial ||
                material instanceof MeshPhysicalMaterial
              ) {
                material.roughness = 0.3;
                material.metalness = 0.8;
                material.needsUpdate = true;
              }
            });
          } else {
            const material = mesh.material;
            if (
              material instanceof MeshStandardMaterial ||
              material instanceof MeshPhysicalMaterial
            ) {
              material.roughness = 0.3;
              material.metalness = 0.8;
              material.needsUpdate = true;
            }
          }
        }
      }
    });

    // audioElement.src = soundFile.sound_file_64;
    // audioElement.load();
    // audioElement.oncanplay = () => {
    //     audioElement.play();

    XR8.XrController.recenter();
    contentContainer.add(model.scene);

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

  module.emitter.on("resume-tracking", () => {
    pauseRender = false;
    clock.start();
  });
  module.emitter.on("pause-tracking", () => {
    pauseRender = true;
  });
  clock.stop();

  module.emitter.on("on-update", () => {
    if (pauseRender) return;
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
