// RendererContext.js
import { useContext, useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { RendererApi, initExperienceRenderer } from '../renderer';
import { createContext, ReactNode } from 'preact/compat';
import { Object3D } from 'three';
import { QRProcessEvents } from '../renderer/8thwall/qr-process-pipeline-module';
import useUrlHash from '../hooks/useUrlHash';

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
    initExperience: () => { },
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
    const currentModelRef = useRef<Object3D | null>(null); // Track the current model

    const { handleQRFound } = useUrlHash();

    const initExperience = useCallback(async () => {
        const canvasEl = document.getElementById('xr-canvas') as HTMLCanvasElement;
        if (!canvasEl) throw new Error('No Canvas element.');
        const renderer = await initExperienceRenderer(canvasEl, {
            watermarkImageUrl: '',
        });
        setRenderer(renderer);
    }, [])

    const clearCurrentArtwork = useCallback(() => {
        if (currentModelRef.current) {
            currentModelRef.current.traverse((object) => {
                if (object.isMesh) {
                    object.geometry?.dispose();
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach((material) => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                }
            });
            renderer?.getScene().remove(currentModelRef.current);
            currentModelRef.current = null;
        }
    }, [renderer]);

    const loadArtwork = useCallback(async (artworkId: string) => {
        console.debug(`loadArtwork(${artworkId})`);
        if (!renderer) throw new Error(`loadArtwork(${artworkId}) but no experience loaded.`);
        clearCurrentArtwork();
        // TODO: check where to put this and why it's needed
        renderer.pauseAudio();
        const model = await renderer.loadArtwork(artworkId);
        if (model) {
            renderer.getScene().add(model);
            currentModelRef.current = model;
        }
    }, [renderer, clearCurrentArtwork]);




    // Handle renderer events and update state
    useEffect(() => {
        if (!renderer) return;

        const handleLoaded = () => {
            setRendererState(RendererState.LOADED);
        };

        const handleTrackingStatus = (status: 'show' | 'hide') => {
            setTrackingStatus(status);
        }
        const handleQR = (model: QRProcessEvents['qr-scan-result']) => {
            handleQRFound(model)
        }

        renderer.on('content-loaded', handleLoaded);
        renderer.on('tracking-status', handleTrackingStatus);
        renderer.on('qr-scan-result', handleQR);
        return () => {
            renderer.off('content-loaded', handleLoaded);
            renderer.off('tracking-status', handleTrackingStatus);
            renderer.off('qr-scan-result', handleQR);
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