const EJUtils = Object.create(null);

EJUtils.clamp = (x, a, b) => Math.max(Math.min(x, Math.max(a, b)), Math.min(a, b));
EJUtils.lerp = (a, b, t) => (b - a) * t + a;
EJUtils.unlerp = (a, b, t) => (t - a) / (b - a);
EJUtils.map = (a1, b1, a2, b2, t) => EJUtils.clamp(EJUtils.lerp(a2, b2, EJUtils.unlerp(a1, b1, t)), a2, b2);

EJUtils.disposeMaterial = (material) => {
    // in case of map, bumpMap, normalMap, envMap ...
    Object.keys(material).forEach((prop) => {
        if (!material[prop]) {
            return;
        }
        if (material[prop] !== null && typeof material[prop].dispose === 'function') {
            material[prop].dispose();
        }
    });
    material.dispose();
};

EJUtils.disposeRecursive = (obj) => {
    while (obj.children.length > 0) {
        disposeRecursive(obj.children[0]);
        obj.remove(obj.children[0]);
    }
    if (obj.geometry) obj.geometry.dispose();

    if (obj.material) {
        if (Array.isArray(obj.material)) {
            obj.material.forEach(EJUtils.disposeMaterial);
        } else {
            EJUtils.disposeMaterial(obj.material);
        }
    }
};

export const clamp = EJUtils.clamp;
export const lerp = EJUtils.lerp;
export const unlerp = EJUtils.unlerp;
export const map = EJUtils.map;
export const disposeRecursive = EJUtils.disposeRecursive;

export default EJUtils;
