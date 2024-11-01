import 'preact/debug';
import { useCallback, useErrorBoundary, useState } from 'preact/hooks';
import { RendererApi, initExperienceRenderer } from './renderer';
import Splash from './features/splash';
import { FadeTransition } from './components/Transitions';
import WatermarkFile from './assets/watermark-logo.png';

import ErrorPage from './features/error';
import { useAppState } from './hooks/useAppState';
import { AppState } from './context/AppStateContext';

export enum RendererState {
    NONE,
    REPOSITIONING,
    PLACED,
    LOADED,
    VIEWING,
}

export enum RepositioningState {
    NONE,
    IS_REPOSITIONING,
    HAS_REPOSITIONED,
}


export function App() {
    const [renderer, setRenderer] = useState<RendererApi | null>(null);

    const { appState, setAppState } = useAppState();

    const initExperience = useCallback(async () => {
        const canvasEl = document.getElementById('xr-canvas') as HTMLCanvasElement;
        if (!canvasEl) throw new Error('No Canvas element.');
        const renderer = await initExperienceRenderer(canvasEl, {
            watermarkImageUrl: WatermarkFile,
        });
        setRenderer(renderer);
        // TODO: if onboarding has not been viewed, setAppState(AppState.ONBOARDING), otherwise setAppState(AppState.ARTWORK_LOADING)
        setAppState(AppState.ONBOARDING)

    }, [])

    const [error] = useErrorBoundary();

    /**
     * JSX
     */
    if (error) {
        return <ErrorPage error={error} />;
    }

    return (
        <>

            <FadeTransition show={appState === AppState.SPLASH}>
                <div className="h-full w-full">
                    <Splash
                        onPermissionsGranted={initExperience}
                    />
                </div>
            </FadeTransition>
            <FadeTransition show={appState === AppState.ONBOARDING}>
                <div>HELLO</div>
            </FadeTransition>
        </>
    );
}
