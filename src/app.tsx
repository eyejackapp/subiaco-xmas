import 'preact/debug';
import { useCallback, useEffect, useErrorBoundary } from 'preact/hooks';
import Splash from './features/splash';
import { FadeTransition } from './components/Transitions';
import ErrorPage from './features/error';
import { useAppState } from './hooks/useAppState';
import { AppState } from './context/AppStateContext';
import { useRenderer } from './hooks/useRenderer';
import useUrlHash from './hooks/useUrlHash';
import { getArtworkIdFromCode } from './utils/qrUtils';

export function App() {

    const { appState, setAppState } = useAppState();
    const { initExperience, loadArtwork, renderer } = useRenderer();
    const { hash } = useUrlHash();

    const handleInitExperience = useCallback(async () => {
        try {
            await initExperience();
            const hasViewedOnboarding = true
            setAppState(hasViewedOnboarding ? AppState.ARTWORK_VIEWING : AppState.ONBOARDING);
            console.log('renderer', renderer);
        } catch (error) {
            console.error('Failed to initialize experience:', error);
        }
    }, [initExperience]);

    const handleLoadArtwork = useCallback(async () => {
        console.log('HANDLE LOAD ARTWORK');
        const artworkId = getArtworkIdFromCode(hash);
        if (!artworkId) {
            throw new Error(`Hash is not valid: ${hash}`);
        }
        await loadArtwork(artworkId);
    }, []);

    useEffect(() => {
        if (!renderer || !hash) return;
        handleLoadArtwork();
    }, [renderer, hash]);

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
                        onPermissionsGranted={handleInitExperience}
                    />
                </div>
            </FadeTransition>
            <FadeTransition show={appState === AppState.ONBOARDING}>
                <div>HELLO</div>
            </FadeTransition>
        </>
    );
}
