import { useCallback, useEffect, useState } from 'preact/hooks';

type Orientation = 'landscape' | 'portrait';

function calculateOrientation() {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

const useScreenOrientation = () => {
    const [orientation, setOrientation] = useState<Orientation>(calculateOrientation());

    const updateOrientation = useCallback(() => {
        const newOrientation = calculateOrientation();
        if (orientation !== newOrientation) setOrientation(newOrientation);
    }, [orientation, setOrientation]);

    useEffect(() => {
        if (!window.screen.orientation) return;
        window.addEventListener('resize', updateOrientation);
        return () => {
            window.removeEventListener('resize', updateOrientation);
        };
    }, [updateOrientation]);

    return orientation;
};

export default useScreenOrientation;
