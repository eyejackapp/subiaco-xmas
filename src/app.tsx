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
    const { hash, updateHash } = useUrlHash();

    const handleInitExperience = useCallback(async () => {
        try {
            await initExperience();
            const hasViewedOnboarding = true
            setAppState(hasViewedOnboarding ? AppState.ARTWORK_VIEWING : AppState.ONBOARDING);
        } catch (error) {
            console.error('Failed to initialize experience:', error);
        }
    }, [initExperience]);

    const handleLoadArtwork = async () => {
        const artworkId = getArtworkIdFromCode(hash);
        if (artworkId) {
            await loadArtwork(artworkId);
            setAppState(AppState.ARTWORK_VIEWING);
        }
    }

    useEffect(() => {
        if (!hash && !renderer) return
        if (appState === AppState.ARTWORK_VIEWING) {
            handleLoadArtwork();
        }
    }, [hash, renderer, appState, handleLoadArtwork]);

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
