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
  Euler,
  Quaternion,
  AxesHelper,
} from "three";
import { Mesh, Object3D, Clock } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js"; // Note: Ensure the correct path if issues arise
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

  /*
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
  */

  const activeRings: Array<{
    mesh: Mesh;
    startTime: number;
    duration: number;
  }> = [];

  const ringLifetime = 0.4;
  const ringDelays = [0.0, 0.133, 0.266];
  const minScale = 0.1;
  const maxScale = 1.0;

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

  const targetModelPosition = new Vector3();
  const modelLerpSpeed = 0.25;

  const contentContainer = new Object3D();
  scene.add(contentContainer);

  function createPulsingRings(position: Vector3) {
    const numRings = 3;

    for (let i = 0; i < numRings; i++) {
      const ringGeometry = new RingGeometry(0.1, 0.115, 32);
      const ringMaterial = new MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1.0,
        side: DoubleSide,
      });
      const ring = new Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.copy(position);
      ring.scale.set(minScale, minScale, minScale);

      ring.position.y += 0.001 * (i + 1);

      scene.add(ring);

      activeRings.push({
        mesh: ring,
        startTime: clock.getElapsedTime() + ringDelays[i],
        duration: ringLifetime,
      });
    }
  }
  const tempVec3 = new Vector3();
  const tempEuler = new Euler();
  const targetQuaternion = new Quaternion();

  module.emitter.on("place-object", (e) => {
    tapPosition.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    tapPosition.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(tapPosition, _camera);

    const intersects = raycaster.intersectObject(surface);

    if (intersects.length === 1 && intersects[0].object === surface) {
      if (!model.scene.children[0]) return;

      targetModelPosition.set(intersects[0].point.x, 0, intersects[0].point.z);

      const dirToCam = tempVec3;
      dirToCam.copy(_camera.position).sub(targetModelPosition).normalize();
      const rotationY = Math.atan2(dirToCam.x, dirToCam.z);
      const rotationEuler = tempEuler;
      rotationEuler.set(0, rotationY, 0, "XYZ");
      targetQuaternion.setFromEuler(rotationEuler);
      createPulsingRings(targetModelPosition);
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
                material.roughness = 0.4;
                material.metalness = 0.6;
                material.needsUpdate = true;
              }
            });
          } else {
            const material = mesh.material;
            if (
              material instanceof MeshStandardMaterial ||
              material instanceof MeshPhysicalMaterial
            ) {
              material.roughness = 0.4;
              material.metalness = 0.6;
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

    if (model.scene.children[0]) {
      targetModelPosition.copy(model.scene.children[0].position);
      const axesHelper = new AxesHelper(1);
      model.scene.children[0].add(axesHelper);
    }

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

    if (activeRings.length > 0) {
      const currentTime = clock.getElapsedTime();

      for (let i = activeRings.length - 1; i >= 0; i--) {
        const ring = activeRings[i];
        const elapsed = currentTime - ring.startTime;
        if (elapsed < 0) {
          continue;
        }
        if (elapsed < ring.duration) {
          const progress = elapsed / ring.duration;

          const scale = minScale + (maxScale - minScale) * progress;
          ring.mesh.scale.set(scale, scale, scale);

          ring.mesh.material.opacity = 1.0 - progress;
        } else {
          scene.remove(ring.mesh);
          ring.mesh.geometry.dispose();
          ring.mesh.material.dispose();
          activeRings.splice(i, 1);
        }
      }
    }
    if (model.scene) {
      model.scene.children[0].position.lerp(
        targetModelPosition,
        modelLerpSpeed
      );

      model.scene.children[0].quaternion.slerp(
        targetQuaternion,
        modelLerpSpeed
      );
    }

    const delta = clock.getDelta();
    mixer.update(delta);
  });

  return { loadArtwork };
}
