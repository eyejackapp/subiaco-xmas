import { useEffect, useState } from 'preact/hooks';
import { RendererState, RepositioningState } from '../../app';
import { GroundDetectionImg } from './GroundDetectionImg';
import { RendererApi } from '../../renderer';
import clsx from 'clsx';

export enum TrackingOverlayStatus {
    NONE,
    TRACKING,
    PLACING,
    VIEWING,
}

type TrackingOverlayProps = {
    status: string | undefined;
    repositioningState: RepositioningState;
    renderer: RendererApi;
};
export function TrackingOverlay({ status, repositioningState, renderer }: TrackingOverlayProps) {
    const [uiStatus, setUiStatus] = useState(status);
    useEffect(() => {
        setUiStatus(status);
        const timeout = setTimeout(() => {
            if (status === 'LIMITED') {
                setUiStatus('NORMAL');
            }
        }, 2000);

        return () => {
            clearTimeout(timeout);
        };
    }, [status]);
    useEffect(() => {
        uiStatus === 'NORMAL' || renderer.hasBeenRepositioned ? renderer.showReticle() : renderer.hideReticle();
    });

    return (
        <>
            <span
                className={clsx('absolute top-[136px] left-4 w-2 h-2 rounded-[50%] animate-fade-in', {
                    'bg-orange-500': status === 'LIMITED',
                    'bg-green-500': status === 'NORMAL',
                })}
            ></span>
            {uiStatus === 'LIMITED' && repositioningState !== RepositioningState.IS_REPOSITIONING && (
                <div className="fixed z-[10] w-full h-full bg-[rgba(0,0,0,0.6)] flex flex-col-reverse animate-fade-in pointer-events-none">
                    <GroundDetectionImg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                    <h2 className="text-center font-extrabold text-2xl tracking-[1px] text-shadow-base pb-12 font-secondary-sans">
                        Move your device to <br /> detect the floor
                    </h2>
                </div>
            )}
            {uiStatus === 'NORMAL' && (
                <div className="fixed z-[10] w-full h-full flex flex-col-reverse animate-fade-in before:content-[''] before:z-10 before:w-full before:h-full before:block before:absolute before:bg-text-overlay">
                    <h2 className="relative z-10 text-center font-extrabold text-2xl tracking-[1px] text-shadow-base pointer-events-none pb-12 font-secondary-sans">
                        Tap on the ground to <br /> position the artwork
                    </h2>
                </div>
            )}
        </>
    );
}
