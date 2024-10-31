import {
    BoxGeometry,
    Material,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    OrthographicCamera,
    ShaderMaterial,
    Texture,
    WebGLRenderer,
} from 'three';

type RenderMaterialsOptions = {
    durationSeconds: number;
};

const handleTexturesOfMaterial = (mat: Material | ShaderMaterial, handler: (tex: Texture) => void) => {
    for (const key in mat) {
        const v = mat[key as keyof Material];
        if (v instanceof Texture) {
            handler(v);
        }
    }

    const smat = mat as ShaderMaterial;
    if (smat.uniforms) {
        for (const key in smat.uniforms) {
            const u = smat.uniforms[key];
            if (u.value instanceof Texture) {
                handler(u.value);
            }
        }
    }
};

export class MaterialsGPUUploader {
    private initialLength: number;
    private mesh: Mesh;
    private camera: OrthographicCamera;

    constructor(private materials: Material[]) {
        this.initialLength = materials.length;

        const mesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
        mesh.scale.setScalar(0.01);
        this.mesh = mesh;

        const camera = new OrthographicCamera(-1, 1, -1, 1);
        camera.position.set(0, 0, -10);
        camera.lookAt(mesh.position);
        this.camera = camera;
    }

    /**
     * Uploads all internal materials/textures to the GPU asyncronously.
     *
     * @param renderer - WebGLRenderer to upload materials with
     */
    uploadMaterials(renderer: WebGLRenderer) {
        let prevTime = performance.now();
        let delta = 0.16;
        return new Promise<void>((res) => {
            const onFrame = () => {
                const now = performance.now();
                delta = (now - prevTime) / 1000;
                prevTime = now;
                this.uploadMaterialsChunk(renderer, {
                    durationSeconds: Math.max(delta * 1.5, 1),
                });

                if (this.progress !== 1) {
                    requestAnimationFrame(onFrame);
                } else {
                    res();
                }
            };
            onFrame();
        });
    }
    /**
     * Uploads a chunk of materials / textures syncronously.
     */
    uploadMaterialsChunk(renderer: WebGLRenderer, options: RenderMaterialsOptions) {
        const startTime = performance.now() / 1000;
        const endTime = startTime + options.durationSeconds;
        console.debug(`MaterialsGPUUploader.uploadMaterialsChunk()  Uploading mats from ${startTime} -> ${endTime}`);
        const startLength = this.materials.length;

        do {
            const mat = this.materials.pop();
            if (!mat) break;

            console.debug('    MaterialsGPUUploader: Uploading mat', mat.uuid);
            this.mesh.material = mat;
            renderer.compile(this.mesh, this.camera);
            handleTexturesOfMaterial(this.mesh.material, (tex) => {
                renderer.initTexture(tex);
            });

            const now = performance.now() / 1000;
            console.debug('    MaterialsGPUUploader: Uploaded mat', mat.uuid, now, endTime);
            if (now > endTime) break;
        } while (this.materials.length > 0);
        console.debug(
            `MaterialsGPUUploader.uploadMaterialsChunk()  Uploaded ${
                startLength - this.materials.length
            } of ${startLength} remaining materials.`,
        );
    }

    get materialsRemaining() {
        return this.materials.length;
    }
    get progress() {
        if (this.initialLength === 0 || this.materials.length === 0) return 1;
        return 1 - this.materials.length / this.initialLength;
    }
    get finished() {
        return this.initialLength > 0 && this.materials.length === 0;
    }

    static fromScene(object: Object3D) {
        console.group('MaterialsGPUUploader.fromScene');
        const materials: Material[] = [];
        object.traverse((ob) => {
            const mesh = ob as Mesh;

            if (Array.isArray(mesh.material)) {
                console.debug(`${ob.uuid} has ${mesh.material.length} materials.`, mesh.material);
                materials.push(...mesh.material);
            } else if (mesh.material) {
                console.debug(`${ob.uuid} has 1 material.`, mesh.material);
                materials.push(mesh.material);
            }
        });
        console.groupEnd();
        return new MaterialsGPUUploader(materials);
    }

    // TODO: Add a dispose method
}
