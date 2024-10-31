import { useEffect, useState } from 'preact/hooks';
import SwipeAnim from './assets/swipe.apng';
import PinchAnim from './assets/pinch.apng';

export enum InstructionsOverlayState {
    HIDDEN,
    ROTATE,
    SCALE,
    COMPLETE,
}

type InstructionsOverlayProps = {
    onInstructionsCompleted: () => void;
    viewedArtworks: string[] | undefined;
};

export function InstructionsOverlay({ onInstructionsCompleted, viewedArtworks }: InstructionsOverlayProps) {
    const [instructionsOverlayState, setInstructionsOverlayState] = useState<InstructionsOverlayState>(
        InstructionsOverlayState.HIDDEN,
    );

    const getNextInstructionsOverlayState = (currentState: InstructionsOverlayState) => {
        const newState = currentState + 1;
        return newState;
    };
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (instructionsOverlayState !== InstructionsOverlayState.COMPLETE) {
            if (instructionsOverlayState === InstructionsOverlayState.HIDDEN) {
                const nextState = getNextInstructionsOverlayState(instructionsOverlayState);
                if (nextState) setInstructionsOverlayState(nextState);
            } else {
                if (viewedArtworks?.length === 1) {
                    timer = setTimeout(() => {
                        const nextState = getNextInstructionsOverlayState(instructionsOverlayState);
                        if (nextState) setInstructionsOverlayState(nextState);
                    }, 5000);
                } else {
                    timer = setTimeout(() => {
                        const nextState = getNextInstructionsOverlayState(instructionsOverlayState);
                        if (nextState) setInstructionsOverlayState(nextState);
                    }, 3000);
                }
            }
        } else {
            onInstructionsCompleted();
        }
        return () => clearTimeout(timer);
    }, [instructionsOverlayState, onInstructionsCompleted, viewedArtworks]);
    return (
        <>
            {instructionsOverlayState === InstructionsOverlayState.ROTATE && (
                <div className="fixed z-[10] w-full h-full flex flex-col-reverse animate-fade-in before:content-[''] before:z-10 before:w-full before:h-full before:block before:absolute before:bg-text-overlay">
                    <div className="relative z-10 pb-16 flex flex-col items-center">
                        <img className="w-28 h-28 mb-5" src={SwipeAnim} />
                        <h2 className="text-center font-extrabold text-2xl tracking-[1px] text-shadow-base font-secondary-sans">
                            Swipe to rotate
                        </h2>
                    </div>
                </div>
            )}
            {instructionsOverlayState === InstructionsOverlayState.SCALE && (
                <div className="fixed z-[10] w-full h-full flex flex-col-reverse animate-fade-in">
                    <div className="pb-16 pt-24 bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.15)] flex flex-col items-center">
                        <img className="w-28 h-28 mb-7" src={PinchAnim} />
                        <h2 className="text-center font-extrabold text-2xl tracking-[1px] text-shadow-base font-secondary-sans">
                            Pinch to scale
                        </h2>
                    </div>
                </div>
            )}
        </>
    );
}
