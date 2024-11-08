import { useCallback, useState, useErrorBoundary, useEffect, useMemo } from "preact/hooks";
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
import { ArtworkId } from "./renderer/artworks";
import { ModalOverlay } from "./components/Modal/ModalOverlay";
import { Modal } from "./components/Modal/Modal";
import { QRProcessEvents } from "./renderer/8thwall/qr-process-pipeline-module";
import { useArtwork } from "./hooks/useArtwork";
import { ArtworkState } from "./context/ArtworkContext";
import { RecordingButton, useVideoRecorder } from "./features/recording-button";
import MediaPreview from "./features/media-preview";

export function App() {
  const [loadingArtwork, setLoadingArtwork] = useState(false);

  const { appState, setAppState } = useAppState();
  const { renderer, initExperience, loadArtwork, showArtworkUnlocked, setShowArtworkUnlocked, clearCurrentArtwork } = useRenderer();
  const { artworkState, setArtworkState, setCurrentArtwork, currentArtwork } = useArtwork();
  const recordingState = useVideoRecorder(renderer);

  // hash change handling
  const handleHashChange = useCallback(() => {
    clearCurrentArtwork();
    setArtworkState(ArtworkState.PLACING);
  }, [clearCurrentArtwork, setArtworkState]);

  const { hash, handleQRFound } = useUrlHash(handleHashChange);

  useEffect(() => {
    if (!renderer) return;
    const onQRScan = (event: QRProcessEvents['qr-scan-result']) => handleQRFound(event);
    renderer.on('qr-scan-result', onQRScan);
    return () => {
      renderer.off('qr-scan-result', onQRScan);
    };
  }, [renderer, handleQRFound]);


  const handleInitExperience = useCallback(async () => {
    try {
      await initExperience();
      const hasViewedOnboarding = true;
      setAppState(
        hasViewedOnboarding ? AppState.ARTWORK_VIEWING : AppState.ONBOARDING
      );
      if (hasViewedOnboarding) setArtworkState(ArtworkState.PLACING)
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
    setArtworkState(ArtworkState.VIEWING);
  }, [loadArtwork, hash, setLoadingArtwork, setCurrentArtwork, setArtworkState]);


  const onVideoCleared = useCallback(() => {
    setAppState(AppState.ARTWORK_VIEWING);
  }, [setAppState]);

  useEffect(() => {
    if (recordingState.state !== 'ready') return;
    setAppState(AppState.MEDIA_SHARE);
  }, [recordingState.state, setAppState]);

  const showArtworkUnlockedModal =
    showArtworkUnlocked &&
    recordingState.state === 'none' &&
    artworkState === ArtworkState.VIEWING;

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
          {artworkState === ArtworkState.PLACING &&
            <TrackingOverlay onStatusNormal={handleLoadArtwork} />
          }
          {
            loadingArtwork && artworkState === ArtworkState.LOADING &&
            <div className="bg-black bg-opacity-75 h-full w-full">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2">
                <Spinner />
              </div>
            </div>
          }
        </div>
      </FadeTransition>
      <FadeTransition show={appState !== AppState.SPLASH}>
        <div className="absolute top-0 w-full">
          <Header />
        </div>
      </FadeTransition>
      <FadeTransition show={showArtworkUnlockedModal}>
        <div className="w-full h-full">
          <ModalOverlay>
            <Modal className="centered h-fit bg-[#EA81A4] px-8 py-16 flex justify-center items-center">
              <div className="flex flex-col items-center justify-center gap-8">
                <h2 className="text-3xl font-bold text-center">Artwork Unlocked!</h2>
                <h3>Artwork: {currentArtwork}</h3>
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

      <FadeTransition show={appState === AppState.ARTWORK_VIEWING} duration={500}>
        <div className="flex fixed bottom-4 left-1/2 justify-center items-center w-full h-full -translate-x-1/2 max-w-[94px] max-h-[94px] z-[1]">
          <RecordingButton recordingState={recordingState} />
        </div>
      </FadeTransition>

      <FadeTransition show={appState === AppState.MEDIA_SHARE}>
        <div className="w-full h-full">
          <MediaPreview recordingState={recordingState} onVideoCleared={onVideoCleared} />
        </div>
      </FadeTransition>
    </div>
  );
}
