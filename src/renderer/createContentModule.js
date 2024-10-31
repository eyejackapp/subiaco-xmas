/* eslint-disable @typescript-eslint/no-unused-vars */
import { Clock, Material, Object3D, AudioLoader } from 'three';
import { MaterialsGPUUploader } from './utils/MaterialGPUUploader';
export async function createContentModule(audio) {
    const THREE = await import('three');
    window.THREE = window.THREE ?? THREE;
    /** @type
     * Patches the play method on an object to try auto start if it fails.
     */
    const patchPlay = (object) => {
        const originalPlay = object.play.bind(object);

        object.play = () => {
            console.log('Attempting to play ', object);
            return new Promise((res, rej) => {
                originalPlay()
                    .play()
                    .catch(() => {
                        window.addEventListener(
                            'pointerdown',
                            () => {
                                originalPlay()
                                    .catch((reason) => {
                                        rej(reason);
                                    })
                                    .then(() => {
                                        res();
                                    });
                            },
                            { once: true },
                        );
                    })
                    .then(res);
            });
        };
    };

    Object3D.prototype.getAudio = function () {
        if (this.userData && this.userData.sound_file_64) {
            if (this.__ejx_audio) {
                return this.__ejx_audio;
            }

            const audioLoader = new AudioLoader();
            audioLoader.load(this.userData.sound_file_64, (buffer) => {
                audio.setBuffer(buffer);
                audio.setVolume(0.9);
                audio.setLoop(true);
                audio.play();
                console.log('source node', audio.source);
            });

            // patchPlay(audio);

            // const audio = document.getElementById('ejx-audio');
            // audio.loop = this.userData.sound_loop;
            // audio.src = this.userData.sound_file_64;
            // if (this.userData.audio_autoplay) audio.play();
            this.__ejx_audio = audio;
            return audio;
        }
        console.warn(
            `EJX: \'getAudio()\' failed on ${this.type} with name ${this.name} because there's no audio attached to this object to get.`,
        );
    };
    Object3D.prototype.getVideo = function () {
        if (this.userData && this.userData.video_file_64) {
            if (this.__ejx_video) {
                return this.__ejx_video;
            }
            const video = document.createElement('video');
            video.loop = this.userData.video_loop;
            video.src = this.userData.video_file_64;
            patchPlay(video);
            video.playsInline = true;
            video.setAttribute('playsinline', '');
            video.muted = true;
            video.setAttribute('muted', '');
            video.crossOrigin = 'anonymous';

            this.__ejx_video = video;
            return video;
        }
        console.warn(
            `EJX: \'getVideo()\' failed on ${this.type} with name ${this.name} because there's no video attached to this object to get.`,
        );
    };

    const main = ({ renderer, renderTarget, camera, scene, loadingManager, gui }) => {
        const contentPerCubeFace = {
            front: 'all',
            right: 'all',
            back: 'all',
            left: 'all',
            top: 'all',
            bottom: 'all',
        };

        let time = 0;
        let startTime = 0;
        let prevTime = 0;
        startTime = prevTime = performance.now();

        /** @type {import('./utils/MaterialGPUUploader').MaterialsGPUUploader|null} */
        let materialsGpuUploader = null;
        const objectLoader = new THREE.ObjectLoader();
        let sceneLoaded = null;
        let sceneLoadedMatrix = null;
        let fetchProgress = 0;
        let loaded = false;
        let postProcessing = null;

        const events = {
            init: [],
            start: [],
            stop: [],
            keydown: [],
            keyup: [],
            pointerdown: [],
            pointerup: [],
            pointermove: [],
            update: [],
        };

        const tryLoadFromFile = true;
        if (tryLoadFromFile) {
            // try loading the app.json file.
            // note, this won't work in the editor,
            // where the load method needs to be called by the editor.
            const fileLoadHandler = (response) => {
                load(JSON.parse(response), false);
            };
            const fileLoader = new THREE.FileLoader(loadingManager);
            fileLoader.load(
                'app.json',
                fileLoadHandler,
                (xhr) => {
                    fetchProgress = xhr.loaded / xhr.total;
                }, // progress handler
                null, // error handler
            );
        }

        const load = async (json, inEditor = true) => {
            const project = json.project;

            if (project.shadows !== undefined) renderer.shadowMap.enabled = project.shadows;
            if (project.shadowType !== undefined) renderer.shadowMap.type = project.shadowType;
            if (project.toneMapping !== undefined) renderer.toneMapping = project.toneMapping;
            if (project.toneMappingExposure !== undefined) renderer.toneMappingExposure = project.toneMappingExposure;
            if (project.useLegacyLights !== undefined) renderer.useLegacyLights = project.useLegacyLights;

            contentPerCubeFace.front = project.faceFront;
            contentPerCubeFace.left = project.faceLeft;
            contentPerCubeFace.back = project.faceBack;
            contentPerCubeFace.right = project.faceRight;
            contentPerCubeFace.top = project.faceTop;
            contentPerCubeFace.bottom = project.faceBottom;

            if (project.postprocessing && project.postprocessing.length > 0) {
                postProcessing = project.postprocessing[0]; // only bloom for now.
                postProcessing.exposure = 1.0; // not included in editor project settings but is required for the player.
            }

            sceneLoaded = objectLoader.parse(json.scene);
            sceneLoadedMatrix = new THREE.Matrix4().compose(
                sceneLoaded.position,
                sceneLoaded.quaternion,
                sceneLoaded.scale,
            );

            const cameraLoaded = objectLoader.parse(json.camera);
            if (inEditor) {
                // when launching in editor, copy over editor camera so that it lines up with the player camera.
                cameraLoaded.updateMatrixWorld();
                camera.copy(cameraLoaded);
            }

            // Async staggered upload materials to GPU
            materialsGpuUploader = MaterialsGPUUploader.fromScene(sceneLoaded);
            await materialsGpuUploader.uploadMaterials(renderer);

            let scriptWrapParams = 'player,renderer,scene,camera';
            const scriptWrapResultObj = {};

            for (const eventKey in events) {
                scriptWrapParams += ',' + eventKey;
                scriptWrapResultObj[eventKey] = eventKey;
            }

            const scriptWrapResult = JSON.stringify(scriptWrapResultObj).replace(/\"/g, '');

            for (const uuid in json.scripts) {
                const object = sceneLoaded.getObjectByProperty('uuid', uuid, true);
                if (object === undefined) {
                    console.warn('EJX.Content: Script without object.', uuid);
                    continue;
                }

                const scripts = json.scripts[uuid];
                for (let i = 0; i < scripts.length; i++) {
                    const script = scripts[i];
                    const functions = new Function(
                        scriptWrapParams,
                        script.source + '\nreturn ' + scriptWrapResult + ';',
                    ).bind(object)(this, renderer, sceneLoaded, camera);
                    for (const name in functions) {
                        if (functions[name] === undefined) {
                            continue;
                        }
                        if (events[name] === undefined) {
                            console.warn('EJX.Content: Event type not supported (', name, ')');
                            continue;
                        }
                        events[name].push(functions[name].bind(object));
                    }
                }
            }

            // Autoplay sound
            sceneLoaded.traverse((obj) => {
                if (obj && obj.userData && obj.userData.sound_autoplay && obj.getAudio) {
                    const audio = obj.getAudio();
                    if (audio) {
                        // audio.play();
                    } else {
                        console.warn('\tCould not autoplay audio.');
                    }
                }
            });

            dispatch(events.init, null);

            // TODO:
            loaded = true; // scene loaded at this point.
        };

        const play = () => {
            dispatch(events.start, null);
        };

        const stop = () => {
            dispatch(events.stop, null);
        };

        const update = () => {
            time = performance.now();
            if (events.update) {
                dispatch(events.update, { time: time - startTime, delta: time - prevTime });
            }
            prevTime = time;
        };

        const render = (contentID) => {
            if (!loaded || sceneLoaded === null) {
                return;
            }

            const visibleSave = [];
            sceneLoaded.children.forEach((child, i) => {
                visibleSave[i] = child.visible;
                if (child.visible) {
                    // only leave on or turn off if visible.
                    const visible = contentID === child.uuid || contentID === 'all';
                    child.visible = visible;
                }
            });

            const sceneMatrix = new THREE.Matrix4().compose(scene.position, scene.quaternion, scene.scale);
            sceneLoaded.visible = scene.visible;
            sceneMatrix.multiply(sceneLoadedMatrix);
            sceneMatrix.decompose(sceneLoaded.position, sceneLoaded.quaternion, sceneLoaded.scale);

            renderer.render(sceneLoaded, camera);

            sceneLoaded.children.forEach((child, i) => {
                child.visible = visibleSave[i];
            });
        };

        const resize = (width, height) => {
            //
        };

        const disposeTextures = (material) => {
            // Explicitly dispose any textures assigned to this material
            for (const propertyName in material) {
                const texture = material[propertyName];

                if (texture instanceof THREE.Texture) {
                    const image = texture.source.data;

                    if (image instanceof ImageBitmap) {
                        image.close && image.close();
                    }

                    texture.dispose();
                }
            }
        };

        const disposeNode = (node) => {
            if (node instanceof THREE.Mesh) {
                if (node.geometry) node.geometry.dispose();

                const material = node.material;
                if (material) {
                    if (Array.isArray(material)) {
                        for (let i = 0, l = material.length; i < l; i++) {
                            const m = material[i];
                            disposeTextures(m);
                            m.dispose();
                        }
                    } else {
                        disposeTextures(material);
                        material.dispose(); // disposes any programs associated with the material
                    }
                }
            }
        };

        const dispose = () => {
            if (sceneLoaded) {
                sceneLoaded.traverse((obj) => {
                    disposeNode(obj);
                    // Puase audios
                    if (obj && obj.__ejx_audio) {
                        obj.__ejx_audio.pause();
                        delete obj.__ejx_audio;
                    }

                    // Pause videos
                    if (obj && obj.__ejx_video) {
                        obj.__ejx_video.pause();
                        delete obj.__ejx_video;
                    }
                });
            }
        };

        const pointerdown = (event) => {
            dispatch(events.pointerdown, event);
        };

        const pointermove = (event) => {
            dispatch(events.pointermove, event);
        };

        const pointerup = (event) => {
            dispatch(events.pointerup, event);
        };

        const keydown = (event) => {
            dispatch(events.keydown, event);
        };

        const keyup = (event) => {
            dispatch(events.keyup, event);
        };

        const dispatch = (array, event) => {
            for (let i = 0, l = array.length; i < l; i++) {
                array[i](event);
            }
        };

        return {
            load: load,
            loaded: () => {
                return loaded && materialsGpuUploader.finished;
            },
            loadProgress: () => {
                const jsonProgress = fetchProgress;
                const materialsProgress = materialsGpuUploader ? materialsGpuUploader.progress : 0;
                return jsonProgress * 0.8 + materialsProgress * 0.2;
            },
            update: update,
            render: render,
            resize: resize,
            dispose: dispose,
            pointerdown: pointerdown,
            pointermove: pointermove,
            pointerup: pointerup,
            keydown: keydown,
            keyup: keyup,
            cubeStyle: () => {
                return 'Plain';
            },
            canGoInsideCube: () => {
                return true;
            },
            contentPerCubeFace: () => {
                return contentPerCubeFace;
            },
            postProcessing: () => {
                return postProcessing;
            },
        };
    };

    return {
        main,
    };
}
