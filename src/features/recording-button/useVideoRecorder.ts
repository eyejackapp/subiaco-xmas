import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { RendererApi, RendererEvents } from '../../renderer';


// THis is a pattern which allows you to expose an API that is only valid when this component is in a certain state.
// If you check the 'state' key for the type of state you want you'll have access to the rest of the object.
type NoneResult = {
    state: 'none';
    startRecording: () => void;
};
type RecordingResult = {
    state: 'recording';
    progress: number;
    stopRecording: () => void;
};
type EncodingResult = {
    state: 'encoding';
};
type RecordedResult = {
    state: 'ready';
    videoUrl: string;
    videoBlob: Blob;
    download: (filename: string) => void;
    clear: () => void;
};

export type VideoRecorderResult = NoneResult | RecordingResult | EncodingResult | RecordedResult;

export function useVideoRecorder(api: RendererApi | undefined): VideoRecorderResult {
    const [state, setState] = useState<VideoRecorderResult['state']>('none');
    const [recordingProgress, setRecordingProgress] = useState(0);

    const [videoBlob, setVideoBlob] = useState<Blob>();

    // Create and cleanup
    const videoUrl = useMemo(() => {
        if (videoBlob) {
            const blob = URL.createObjectURL(videoBlob);
            return blob;
        }
    }, [videoBlob]);
    useEffect(() => {
        return () => videoUrl && URL.revokeObjectURL(videoUrl);
    }, [videoUrl]);

    useEffect(() => {
        if (!api) return;

        const handleStart = () => {
            if (state !== 'none') console.warn(`Recording started but state not None. Instead found ${state}`);
            // console.log('Start');
            setState('recording');
        };
        const handleStop = () => {
            if (state !== 'recording')
                console.warn(`Recording stopped but state not Recording. Instead found ${state}`);
            // console.log('Stop');
            setState('encoding');
            setRecordingProgress(0);
        };
        const handleReady = async (blob: RendererEvents['recording-ready']) => {
            if (state !== 'encoding') console.warn(`Recording ready but state not Processing. Instead found ${state}.`);
            setVideoBlob(blob);
            // console.log('Saved to indexed-db');
            // console.log('Ready');
            setState('ready');
        };
        const handleRecordingProgress = (model: RendererEvents['recording-progress']) => {
            setRecordingProgress(model.elapsedSeconds / model.totalSeconds);
        };

        api.on('recording-started', handleStart);
        api.on('recording-stopped', handleStop);
        api.on('recording-ready', handleReady);
        api.on('recording-progress', handleRecordingProgress);
        return () => {
            api.off('recording-started', handleStart);
            api.off('recording-stopped', handleStop);
            api.off('recording-ready', handleReady);
            api.off('recording-progress', handleRecordingProgress);
        };
    }, [api, state]);

    const handleStartRecording = useCallback(() => {
        if (!api) throw new Error('Cannot start recording until renderer api is provided.');
        api.startRecording();
    }, [api]);

    const handleStopRecording = useCallback(() => {
        if (!api) throw new Error('Cannot start recording until renderer api is provided.');
        api.stopRecording();
    }, [api]);

    const handleClear = useCallback(() => {
        setVideoBlob(undefined);
        setState('none');
    }, []);

    const download = useCallback(
        (filename: string) => {
            if (videoBlob) {
                try {
                    const videoFile = new File([videoBlob], filename, {type: videoBlob.type});
                    navigator.share({
                        title: 'Bankstown Wander',
                        text: 'Bankstown Wander',
                        files: [videoFile],
                    });
                    console.log('Successfully shared');
                } catch (error: any) {
                    console.error('Error sharing:', error.message);
                }
            }
        },
        [videoBlob],
    );

    if (state === 'none') {
        return { state, startRecording: handleStartRecording };
    } else if (state === 'recording') {
        return { state, progress: recordingProgress, stopRecording: handleStopRecording };
    } else if (state === 'encoding') {
        return { state };
    } else if (state === 'ready') {
        if (!videoBlob)
            throw new Error('useVideoRecorder: Something set state to "ready" but videoBlob is still undefined.');
        if (!videoUrl)
            throw new Error('useVideoRecorder: Something set state to "ready" but videoUrl is still undefined.');
        return {
            state,
            videoUrl,
            videoBlob,
            clear: handleClear,
            download,
        };
    } else {
        throw new Error(`useVideoRecorder: Unhandled state type ${state}.  Please implement/fix.`);
    }
}
