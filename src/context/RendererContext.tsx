// RendererContext.js
import { useContext, useState, useEffect, useCallback } from 'preact/hooks';
import { RendererApi, initExperienceRenderer } from '../renderer';
import { createContext, ReactNode } from 'preact/compat';

export enum RendererState {
    NONE,
    PLACED,
    LOADED,
    VIEWING,
}
type RendererContextType = {
    renderer: RendererApi | null;
    rendererState: RendererState;
    trackingStatus: 'show' | 'hide';
    loadArtwork: (artworkId: string) => Promise<void> | void;
    initExperience: () => Promise<void> | void;
    clearCurrentArtwork: () => void;
  };

export const RendererContext = createContext<RendererContextType>({
    renderer: null,
    rendererState: RendererState.NONE,
    trackingStatus: 'show',
    initExperience: () => {},
    loadArtwork: (artworkId: string) => { },
    clearCurrentArtwork: () => { },
});

export const useRenderer = () => {
    return useContext(RendererContext);
};

export type RendererProviderProps = {
    children: ReactNode;
}

export const RendererProvider = ({ children }: RendererProviderProps) => {
    const [renderer, setRenderer] = useState<RendererApi | null>(null);
    const [rendererState, setRendererState] = useState(RendererState.NONE);
    const [trackingStatus, setTrackingStatus] = useState<'show' | 'hide'>('show');

    const initExperience = useCallback(async () => {
        const canvasEl = document.getElementById('xr-canvas') as HTMLCanvasElement;
        if (!canvasEl) throw new Error('No Canvas element.');
        const renderer = await initExperienceRenderer(canvasEl, {
            watermarkImageUrl: '',
        });
        setRenderer(renderer);
    }, [])

    const loadArtwork = useCallback(async (artworkId: string) => {
        console.log(`loadArtwork(${artworkId})`, renderer);
        if (!renderer) throw new Error(`loadArtwork(${artworkId}) but no experience loaded.`);
        // TODO: check where to put this and why it's needed
        renderer.pauseAudio();
        await renderer.loadArtwork(artworkId);
    }, [renderer]);


    const clearCurrentArtwork = useCallback(() => {
        // ... clear current artwork in renderer
    }, [renderer]);

    // Handle renderer events and update state
    useEffect(() => {
        if (!renderer) return;

        const handleLoaded = () => {
            setRendererState(RendererState.LOADED);
        };

        const handleTrackingStatus = (status: 'show' | 'hide') => {
            setTrackingStatus(status);
        }

        renderer.on('content-loaded', handleLoaded);
        renderer.on('tracking-status', handleTrackingStatus);

        return () => {
            renderer.off('content-loaded', handleLoaded);
            renderer.off('tracking-status', handleTrackingStatus);

        };
    }, [renderer]);

    return (
        <RendererContext.Provider
            value={{
                renderer,
                rendererState,
                trackingStatus,
                initExperience,
                loadArtwork,
                clearCurrentArtwork,
            }}
        >
            {children}
        </RendererContext.Provider>
    );
};
