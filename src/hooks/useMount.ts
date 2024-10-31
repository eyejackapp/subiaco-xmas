import { EffectCallback, useEffect, useRef } from 'preact/hooks';

/**
 * Variation on useEffect that will only run once, you really
 * shouldnt need to use this function to much.
 */
export function useMount(onMount: EffectCallback) {
    const hasMountedRef = useRef(false);
    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            onMount();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
