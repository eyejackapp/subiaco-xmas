import { useState } from 'preact/hooks';
import { Modal } from '../../components/Modal/Modal';
import { ModalOverlay } from '../../components/Modal/ModalOverlay';
import { VideoRecorderResult } from '../recording-button';
import clsx from 'clsx';

export type MediaPreviewProps = {
    recordingState: VideoRecorderResult;
    onVideoCleared: () => void;
};

export function MediaPreview({ recordingState, onVideoCleared }: MediaPreviewProps) {
    const [videoLoaded, setVideoLoaded] = useState(false)
    const onVideoDataLoaded = () => { 
        setVideoLoaded(true)
    };

    if (recordingState.state !== 'ready') return null;
    return (
        <ModalOverlay className="z-[200]">
            <Modal
                maxHeight="max-h-full"
                className={clsx('flex flex-col items-center justify-evenly p-4 h-full centered')}
            >
                <div className="relative w-auto border-white z-[100] border-[3px] rounded-[22px]  max-w-[60vw]">
                    {recordingState.state === 'ready' && (
                        <>
                            <button className="absolute top-3 right-3 z-[100]" onClick={onVideoCleared}>
                                <svg
                                    width="33"
                                    height="33"
                                    viewBox="0 0 33 33"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g opacity="1">
                                        <rect
                                            x="0.000244141"
                                            width="32.8244"
                                            height="32.8244"
                                            rx="16.4122"
                                            fill="rgba(0,0,0,0.4)"
                                        />
                                        <path
                                            d="M11.1989 20.723C10.8586 21.0633 10.8516 21.6675 11.2058 22.0217C11.567 22.3759 12.1712 22.369 12.5046 22.0356L16.6162 17.924L20.7208 22.0287C21.0681 22.3759 21.6654 22.3759 22.0196 22.0217C22.3738 21.6606 22.3738 21.0702 22.0265 20.723L17.9219 16.6183L22.0265 12.5067C22.3738 12.1594 22.3808 11.5621 22.0196 11.2079C21.6654 10.8537 21.0681 10.8537 20.7208 11.201L16.6162 15.3056L12.5046 11.201C12.1712 10.8607 11.56 10.8468 11.2058 11.2079C10.8516 11.5621 10.8586 12.1733 11.1989 12.5067L15.3035 16.6183L11.1989 20.723Z"
                                            fill="white"
                                        />
                                    </g>
                                </svg>
                            </button>
                            <video
                                src={recordingState.videoUrl}
                                className={clsx('object-cover rounded-[20px] min-h-[50vh]', {
                                    'animate-skeleton-load bg-gray-300 ': !videoLoaded,
                                })}
                                playsInline
                                autoPlay
                                muted
                                loop
                                onLoadedData={onVideoDataLoaded}
                            />
                        </>
                    )}
                </div>
                <div className="flex flex-col flex-shrink-0 justify-center items-center text-white">
                    {(recordingState.state === 'ready' || true) && (
                        <>
                            <button
                                className="mt-4 refraction-button bg-[#11d398] border-[#11d398] active:opacity-70"
                                onClick={() => recordingState.download('bankstown_wander_video.mp4')}
                            >
                                Share
                            </button>
                            <p className="py-6 text-md leading-6 text-center font-[500] text-shadow-base">
                                Don’t forget to use #bankstownwander
                                <br />
                                when your sharing on socials.
                            </p>
                        </>
                    )}
                </div>
            </Modal>
        </ModalOverlay>
    );
}
