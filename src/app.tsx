import { useCallback, useEffect, useErrorBoundary } from 'preact/hooks';
import Splash from './features/splash';
import { FadeTransition } from './components/Transitions';
import ErrorPage from './features/error';
import { useAppState } from './hooks/useAppState';
import { AppState } from './context/AppStateContext';
import { useRenderer } from './hooks/useRenderer';
import useUrlHash from './hooks/useUrlHash';
import { getArtworkIdFromCode } from './utils/qrUtils';
import { useTimeout } from './hooks/useTimeout';
import UserForm from './components/UserForm';

export function App() {

    const { appState, setAppState } = useAppState();
    const { initExperience, loadArtwork, renderer, trackingStatus } = useRenderer();
    const { hash } = useUrlHash();

    const handleInitExperience = useCallback(async () => {
        try {
            await initExperience();
            const hasViewedOnboarding = true
            setAppState(hasViewedOnboarding ? AppState.ARTWORK_VIEWING : AppState.ONBOARDING);
        } catch (error) {
            console.error('Failed to initialize experience:', error);
        }
    }, [initExperience]);

    const handleLoadArtwork = useCallback(async () => {
        const artworkId = getArtworkIdFromCode(hash);
        console.log('Load artwork:', artworkId);
        if (!artworkId) {
            throw new Error(`Hash is not valid: ${hash}`);
        }
        await loadArtwork(artworkId);
    }, [loadArtwork]);


    const { start: startTimeout, clear: clearTimeout } = useTimeout(handleLoadArtwork, 5000);

    useEffect(() => {
        if (!renderer) return;
        console.log('trackingstatus', trackingStatus)
        if (trackingStatus === 'hide') {
            clearTimeout();
            handleLoadArtwork();
        } else {
            startTimeout();
        }

    }, [trackingStatus, renderer, startTimeout, clearTimeout, handleLoadArtwork],);

    const [error] = useErrorBoundary();

    /**
     * JSX
     */
    if (error) {
        return <ErrorPage error={error} />;
    }

    return (
        <>
            <UserForm />
            {/* <FadeTransition show={appState === AppState.SPLASH}>
                <div className="h-full w-full">
                    <Splash
                        onPermissionsGranted={handleInitExperience}
                    />
                </div>
            </FadeTransition>
            <FadeTransition show={appState === AppState.ONBOARDING}>
                <div>HELLO</div>
            </FadeTransition> */}
        </>
    );
}
