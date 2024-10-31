import clsx from 'clsx';
import { VideoRecorderResult } from './useVideoRecorder';
import { useCallback } from 'preact/hooks';

export * from './useVideoRecorder';

type RecordingButtonProps = {
    recordingState: VideoRecorderResult;
};
/**
 * All of the video recording logic is implemented within the `useVideoRecorder` hook.
 * This component is basically just styling.
 */
export function RecordingButton({ recordingState }: RecordingButtonProps) {
    const handleButtonClick = useCallback(() => {
        if (recordingState.state === 'none') {
            recordingState.startRecording();
        } else if (recordingState.state === 'recording') {
            recordingState.stopRecording();
        } else if (recordingState.state === 'ready') {
            recordingState.clear();
        }
    }, [recordingState]);

    return (
        <>
            <div
                className=" transition-opacity duration-500 ease-in-out w-full h-full max-h-[94px] z-[1] pointer-events-auto"
                data-recording-state={recordingState.state}
            >
                <>
                    <svg
                        viewBox="0 0 38 38"
                        id="progressContainer"
                        className={clsx('block absolute top-0 left-0 w-full h-full', {
                            'opacity-1 scale-[1] ': recordingState.state === 'recording',
                            'scale-[0.9] transition-[0.3s_transform,_0.3s_opacity] !duration-300':
                                recordingState.state !== 'recording',
                        })}
                    >
                        <circle
                            id="progressTrack"
                            className={clsx('fill-[rgba(0,0,0,0.2)] stroke-[2px]', {
                                'transition-[0.8s_stroke] !duration-700 stroke-coral-red-500':
                                    recordingState.state === 'recording',
                                'stroke-white': recordingState.state !== 'recording',
                            })}
                            r="16"
                            cx="19"
                            cy="19"
                        ></circle>
                        <circle
                            id="progressBar"
                            className={clsx(
                                'progressBar fill-transparent stroke-[2px] transition-[0] origin-center stroke-white rotate-[-90deg]',
                                {
                                    'opacity-1': recordingState.state === 'recording',
                                    'opacity-0': recordingState.state !== 'recording',
                                },
                            )}
                            style={{
                                strokeDashoffset:
                                    recordingState.state === 'recording'
                                        ? `${-Number(recordingState.progress.toFixed(2)) * 100}`
                                        : null,
                            }}
                            r="16"
                            cx="19"
                            cy="19"
                        ></circle>
                        <circle
                            id="loadingCircleRecording"
                            className={clsx('fill-transparent stroke-[2px] stroke-coral-red-500 origin-center', {
                                'opacity-1 animate-[record-button-spin_1.1s_linear_infinite_both] ease-in-out':
                                    recordingState.state === 'encoding',
                                'opacity-0': recordingState.state !== 'encoding',
                            })}
                            r="16"
                            cx="19"
                            cy="19"
                        ></circle>
                    </svg>
                    <button
                        className={clsx(
                            'absolute top-0 left-0 origin-center bg-coral-red-500 transition-[0.3s_border-radius,_0.3s_transform] w-full h-full rounded-full text-transparent',
                            {
                                'scale-[0.6]': recordingState.state === 'recording',
                                'scale-[0.35]': recordingState.state !== 'recording',
                            },
                        )}
                        onClick={handleButtonClick}
                    ></button>
                </>
            </div>
        </>
    );
}
