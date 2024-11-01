import 'preact/debug';
import { useCallback, useEffect, useErrorBoundary } from 'preact/hooks';
import Splash from './features/splash';
import { FadeTransition } from './components/Transitions';

import ErrorPage from './features/error';
import { useAppState } from './hooks/useAppState';
import { AppState } from './context/AppStateContext';
import { useRenderer } from './hooks/useRenderer';
import { ArtworkId } from './renderer/artworks';


export const QR_CODE_LOOKUP = {
    '9734': 'artwork-1',
    '6495': 'artwork-2',
    '8719': 'artwork-3',
    '4842': 'artwork-4',
    '1425': 'artwork-5',
    '3274': 'artwork-6',
    '9806': 'artwork-7',
    '7730': 'artwork-8',
};

const validCodes = ['9734', '6495', '8719', '4842', '1425', '3274', '9806', '7730'];
const validCodeRegex = new RegExp(`\\b(${validCodes.join('|')})\\b`);


export function App() {

    const { appState, setAppState } = useAppState();
    const { initExperience, loadArtwork, renderer } = useRenderer();

    const handleInitExperience = async () => {
        try {
            await initExperience();
        } catch (error) {
            console.error('Failed to initialize experience:', error);
        }

    }

    const handleLoadArtwork = useCallback(
        async () => {
            if (window.location.hash) {
                const artworkNumber = location.hash.split('#').pop() as ArtworkId;
                if (artworkNumber && !validCodeRegex.test(artworkNumber)) return;
                const artworkId = QR_CODE_LOOKUP[
                    artworkNumber as '9734' | '6495' | '8719' | '4842' | '1425' | '3274' | '9806' | '7730'
                ] as ArtworkId;
                //   setCurrentArtwork(artworkId);
                await loadArtwork(artworkId);
            }
        },
        [loadArtwork]
    );

    useEffect(() => {
        if (renderer) {
            console.log('renderer change')
            // TODO: if onboarding has not been viewed, setAppState(AppState.ONBOARDING), otherwise setAppState(AppState.ARTWORK_LOADING)
            setAppState(AppState.ARTWORK_VIEWING);
            handleLoadArtwork();
        }
    }, [renderer]);


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
