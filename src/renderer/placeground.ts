import { PlacegroundPipelineModuleResult } from './8thwall/placeground-pipeline-module';
import {
    Audio,
    AnimationClip,
    AnimationMixer,
    Camera,
    Group,
    Object3DEventMap,
    Scene,
    Vector3,
    Matrix4,
    Frustum,
} from 'three';
import { Mesh, Object3D, Clock } from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { ArtworkModel, ARTWORKS } from './artworks';
export type I3dPipeline = {
    loadArtwork: (artworkData: ArtworkModel) => Promise<Group<Object3DEventMap>>;
};
export function init3dExperience(
    module: PlacegroundPipelineModuleResult,
    scene: Scene,
    _camera: Camera,
    audio: Audio,
) {
    let mixer: AnimationMixer;

    const clock = new Clock(true);
    // const audioElement = document.getElementById(
    //     'ejx-audio',
    // ) as HTMLAudioElement;
    // audio.setMediaElementSource(audioElement);

    const cameraWorldDirection = new Vector3();

    const loadArtwork = async (artworkData: ArtworkModel) => {
        const loader = new GLTFLoader();
        const model = await loader.loadAsync(
           artworkData.basePath,
            (progress) => {
                module.emitter.emit('content-load-progress', {
                    progress: progress.loaded,
                    total: progress.total,
                });
            },
        );

        model.scene.traverse((child) => {
            if ((child as Mesh).isMesh) {
                child.frustumCulled = false;
            }
        });

        // animate the model
        mixer = new AnimationMixer(model.scene);
        model.animations.forEach((clip: AnimationClip) => {
            mixer.clipAction(clip.optimize()).play();
        });
        scene.traverse((object) => {
            object.frustumCulled = false;
        });
        module.emitter.emit('content-loaded');
        model.scene.scale.set(0.001, 0.001, 0.001);

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
            contentContainer.add(model.scene);
        // };

        return model.scene;
    };

    const contentContainer = new Object3D();
    scene.add(contentContainer);

    module.emitter.on('on-update', () => {
        if (!mixer) {
            return;
        }
        _camera.getWorldDirection(cameraWorldDirection);

        const isCameraFaceDown = cameraWorldDirection.y < -0.55;
        module.emitter.emit('on-camera-down', isCameraFaceDown);
        // Animate the model
        const delta = clock.getDelta();
        mixer.update(delta);
    });

    return { loadArtwork };
}
