import { useEffect, useRef, useCallback } from "preact/hooks";

export function useTimeout(callback: () => void, delay: number) {
    const savedCallback = useRef(callback);
    const timeoutId = useRef<number | null>(null); // Store timeout ID

    // Remember the latest callback if it changes.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Clear the timeout
    const clear = useCallback(() => {
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
            timeoutId.current = null;
        }
    }, []);

    // Start the timeout
    const start = useCallback(() => {
        clear();
        if (delay !== null) {
            timeoutId.current = setTimeout(() => savedCallback.current(), delay);
        }
    }, [clear, delay]);

    // Reset the timeout (clear and then start again)
    const reset = useCallback(() => {
        start();
    }, [start]);

    // Set up the timeout automatically on mount if delay is specified
    useEffect(() => {
        start();
        return clear;
    }, [delay, start, clear]);

    return { start, clear, reset };
}
