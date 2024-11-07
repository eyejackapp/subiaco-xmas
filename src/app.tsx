import { useCallback, useState, useErrorBoundary } from "preact/hooks";
import Splash from "./features/splash";
import { FadeTransition } from "./components/Transitions";
import ErrorPage from "./features/error";
import { useAppState } from "./hooks/useAppState";
import { AppState } from "./context/AppStateContext";
import { useRenderer } from "./hooks/useRenderer";
import useUrlHash from "./hooks/useUrlHash";
import { getArtworkIdFromCode } from "./utils/qrUtils";
import TrackingOverlay from "./features/tracking-overlay";
import { Spinner } from "./components/Spinner";
import Header from "./features/header";
import { useArtwork } from "./context/ArtworkContext";
import { ArtworkId } from "./renderer/artworks";
import { ModalOverlay } from "./components/Modal/ModalOverlay";
import { Modal } from "./components/Modal/Modal";

export function App() {
  const [loadingArtwork, setLoadingArtwork] = useState(false);

  const { appState, setAppState } = useAppState();
  const { initExperience, loadArtwork, showArtworkUnlocked, setShowArtworkUnlocked } = useRenderer();
  const { hash } = useUrlHash();
  const { setCurrentArtwork } = useArtwork();

  const handleInitExperience = useCallback(async () => {
    try {
      await initExperience();
      const hasViewedOnboarding = true;
      setAppState(
        hasViewedOnboarding ? AppState.ARTWORK_VIEWING : AppState.ONBOARDING
      );
    } catch (error) {
      console.error("Failed to initialize experience:", error);
    }
  }, [initExperience]);

  const handleLoadArtwork = useCallback(async () => {
    setLoadingArtwork(true);
    const artworkId = getArtworkIdFromCode(hash) as ArtworkId;
    console.log("Load artwork:", hash, artworkId);
    if (!artworkId) {
      throw new Error(`Hash is not valid: ${hash}`);
    }
    await loadArtwork(artworkId);
    setLoadingArtwork(false);
    setCurrentArtwork(artworkId)
  }, [loadArtwork, hash, setLoadingArtwork, setCurrentArtwork]);


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
          <Splash onPermissionsGranted={handleInitExperience} />
        </div>
      </FadeTransition>
      <FadeTransition show={appState === AppState.ARTWORK_VIEWING}>
        <div className="h-full w-full">
          <TrackingOverlay onStatusNormal={handleLoadArtwork} />
          {loadingArtwork && (
            <div className="bg-black bg-opacity-75 h-full w-full">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2">
                <Spinner />
              </div>
            </div>
          )}
        </div>
      </FadeTransition>
      <FadeTransition show={appState !== AppState.SPLASH}>
        <div className="absolute top-0 w-full">
          <Header />
        </div>
      </FadeTransition>
      <FadeTransition show={showArtworkUnlocked}>
        <div className="w-full h-full">
          <ModalOverlay>
            <Modal className="centered h-fit bg-[#EA81A4] px-8 py-16 flex justify-center items-center">
              <div className="flex flex-col items-center justify-center gap-8">
                <h1 className="text-3xl font-bold text-center">Artwork Unlocked!</h1>
                <button
                  className="mt-4 px-4 py-2 border-white border-2 max-w-[230px] w-full text-white rounded"
                  onClick={() => setShowArtworkUnlocked(false)}
                >
                  OK
                </button>
              </div>
            </Modal>
          </ModalOverlay>
        </div>
      </FadeTransition>
    </div>
  );
}
