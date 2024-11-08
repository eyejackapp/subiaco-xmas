import { useEffect, useState } from 'preact/hooks';
import { memo } from 'preact/compat'
import { GroundDetectionImg } from './GroundDetectionImg';
import clsx from 'clsx';
import { useRenderer } from '@/hooks/useRenderer';
import { useMount } from '@/hooks/useMount';
import { useArtwork } from '@/hooks/useArtwork';
import { ArtworkState } from '@/context/ArtworkContext';

type TrackingOverlayProps = {
    onStatusNormal: () => void;
}

export const TrackingOverlay = memo(function TrackingOverlay({ onStatusNormal }: TrackingOverlayProps) {
    const [uiStatus, setUiStatus] = useState('LIMITED');
    const { trackingStatus } = useRenderer();
    const {setArtworkState} = useArtwork();

    useMount(() => {
        setUiStatus(trackingStatus)
        const timeout = setTimeout(() => {
            if (trackingStatus === 'LIMITED') {
                setUiStatus('NORMAL');
                setArtworkState(ArtworkState.LOADING);
                onStatusNormal();
            }
        }, 5000);

        return () => {
            clearTimeout(timeout);
        };
    });

    return (
        <>
            <span
                className={clsx('absolute top-[100px] left-4 w-2 h-2 rounded-[50%] animate-fade-in', {
                    'bg-orange-500': trackingStatus === 'LIMITED',
                    'bg-green-500': trackingStatus === 'NORMAL',
                })}
            ></span>
            {uiStatus === 'LIMITED' && (
                <div className="fixed z-[10] w-full h-full bg-[rgba(0,0,0,0.6)] flex flex-col-reverse animate-fade-in pointer-events-none">
                    <GroundDetectionImg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                    <h2 className="text-center font-extrabold text-2xl tracking-[1px] text-shadow-base pb-12 font-secondary-sans">
                        Move your device to <br /> detect the floor
                    </h2>
                </div>
            )}
        </>
    );
})
