import { useState } from 'preact/hooks';
import { useMount } from '../../hooks/useMount';

type TimeGuardLoadingResult = {
    state: 'loading';
    timestampMs: undefined;
};
type TimeGuardCalculatedResult = {
    state: 'ok' | 'blocked';
    /* unix epoch in milliseconds */
    timestampMs: number;
    /* Delta to targetTime in milliseconds */
    deltaMs: number;
};

type TimeGuardResult = TimeGuardLoadingResult | TimeGuardCalculatedResult;

const GET_TIME_ENDPOINT = '/api/time';

/**
 * Hook that manages a timeguard by getting current time from the API
 * and then updating in on the client.
 *
 * @param targetTimeMs The target unixepoch time in MS.
 */
export default function useTimeGuard(targetTimeMs: number): TimeGuardResult {
    const [currentTimeMs, setCurrentTimeMs] = useState<number | undefined>();
    useMount(() => {
        setInterval(() => {
            setCurrentTimeMs(Date.now());
        }, 500);
    });

    if (currentTimeMs === undefined) {
        return {
            state: 'loading',
            timestampMs: undefined,
        };
    } else if (currentTimeMs > targetTimeMs) {
        return {
            state: 'ok',
            timestampMs: currentTimeMs,
            deltaMs: currentTimeMs - targetTimeMs,
        };
    } else {
        return {
            state: 'blocked',
            timestampMs: currentTimeMs,
            deltaMs: currentTimeMs - targetTimeMs,
        };
    }
}
