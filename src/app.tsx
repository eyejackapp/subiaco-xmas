import { useCallback, useEffect, useErrorBoundary, useState } from 'preact/hooks';
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
import { Pass } from 'three/examples/jsm/Addons';
import useUserManager from './hooks/useUserManager';
import InstructionsOverlay from './features/instructions-overlay';
import TrackingOverlay from './features/tracking-overlay';
import { Spinner } from './components/Spinner';

export function App() {
    const [loadingArtwork, setLoadingArtwork] = useState

    const { appState, setAppState } = useAppState();
    const { initExperience, loadArtwork } = useRenderer();
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
        setLoadingArtwork(true)
        const artworkId = getArtworkIdFromCode(hash);
        console.log('Load artwork:', artworkId);
        if (!artworkId) {
            throw new Error(`Hash is not valid: ${hash}`);
        }
        await loadArtwork(artworkId);
        setLoadingArtwork(false)
    }, [loadArtwork, hash, setLoadingArtwork]);
    console.log('app')

    const [error] = useErrorBoundary();

    /**
     * JSX
     */
    if (error) {
        return <ErrorPage error={error} />;
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            {/* <UserForm /> */}
            <FadeTransition show={appState === AppState.SPLASH}>
                <div className="h-full w-full">
                    <Splash
                        onPermissionsGranted={handleInitExperience}
                    />
                </div>
            </FadeTransition>
            <FadeTransition show={appState === AppState.ARTWORK_VIEWING}>
                <div className="h-full w-full">
                    <TrackingOverlay onStatusNormal={handleLoadArtwork} />
                    {artworkLoading && <div className="bg-black bg-opacity-75 h-full w-full"><Spinner /></div>}
                </div>
            </FadeTransition>
        </div>
    );
}
