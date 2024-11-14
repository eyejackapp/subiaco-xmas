import { useCallback, useState, useErrorBoundary, useEffect, useMemo } from "preact/hooks";
import { createPortal } from "preact/compat";
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
import { ArtworkId, ARTWORKS_LENGTH } from "./renderer/artworks";
import { ModalOverlay } from "./components/Modal/ModalOverlay";
import { Modal } from "./components/Modal/Modal";
import { useArtwork } from "./hooks/useArtwork";
import { ArtworkState } from "./context/ArtworkContext";
import { RecordingButton, useVideoRecorder } from "./features/recording-button";
import MediaPreview from "./features/media-preview";
import { useLocalStorageState } from "ahooks";
import { OnboardingModals } from "./features/onboarding";
import { useUserForm } from "./hooks/useUserForm";
import Star from './assets/star-lg.svg';
import CongratsLogo from './assets/congrats-logo.svg';
import CongratsStars from './assets/congrats-stars.png';

export function App() {
  const [loadingArtwork, setLoadingArtwork] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [hasViewedOnboarding, setHasViewedOnboarding] = useLocalStorageState('hasViewedOnboarding', { defaultValue: false });
  const [hasViewedCongrats, setHasViewedCongrats] = useLocalStorageState('hasViewedCongrats', { defaultValue: false });
  const [shouldShowArtworkUnlocked, setShouldShowArtworkUnlocked] = useState(false);
  const [limitReached, setLimitReached] = useState<boolean>(false);


  const { appState, setAppState, isHeaderOpen, setIsSurveyOpen, showThankYouModal, setShowThankYouModal } = useAppState();
  const { renderer, initExperience, loadArtwork, clearCurrentArtwork } = useRenderer();
  const { artworkState, setArtworkState, setCurrentArtwork, currentArtworkModel, regularArtworks, showArtworkUnlocked, setShowArtworkUnlocked, viewedArtworks, setViewedArtworks } = useArtwork();
  const recordingState = useVideoRecorder(renderer!);
  const { hasHitSubmissionLimit } = useUserForm();

  const handleShowingArtworkUnlockedModal = useCallback(() => {
    if (shouldShowArtworkUnlocked) {
      setShowArtworkUnlocked(true)
    }

  }, [shouldShowArtworkUnlocked, setShowArtworkUnlocked]);

  const handleHashChange = useCallback(() => {
    if (shouldShowArtworkUnlocked) {
      setArtworkState(ArtworkState.NONE);
      setShowArtworkUnlocked(true)
    } else {
      setArtworkState(ArtworkState.PLACING);

    }
    clearCurrentArtwork();
    renderer?.pauseAudio();
  }, [clearCurrentArtwork, setArtworkState, renderer, shouldShowArtworkUnlocked, setShowArtworkUnlocked]);

  const { hash, handleQRFound } = useUrlHash(handleHashChange);

  useEffect(() => {
    const handleVisiblityChange = () => {
      if (document.visibilityState === 'visible') {
        //
      } else {
        renderer?.pauseAudio()
      }
    };

    window.addEventListener('visibilitychange', handleVisiblityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisiblityChange);
    };
  }, [renderer]);


  useEffect(() => {
    if (!renderer) return;

    renderer.on('qr-scan-result', handleQRFound);
    renderer.on('on-animation-loop', handleShowingArtworkUnlockedModal);
    return () => {
      renderer.off('qr-scan-result', handleQRFound);
      renderer.off('on-animation-loop', handleShowingArtworkUnlockedModal);
    };
  }, [renderer, handleQRFound, setShowArtworkUnlocked, shouldShowArtworkUnlocked, handleShowingArtworkUnlockedModal]);


  const handleInitExperience = useCallback(async () => {
    try {
      await initExperience();
      setAppState(
        hasViewedOnboarding ? AppState.ARTWORK_VIEWING : AppState.ONBOARDING
      );
      if (hasViewedOnboarding) setArtworkState(ArtworkState.PLACING)
    } catch (error) {
      console.error("Failed to initialize experience:", error);
    }
  }, [initExperience, setAppState, setArtworkState, hasViewedOnboarding]);

  const handleLoadArtwork = useCallback(async () => {
    setLoadingArtwork(true);
    try {
      const artworkId = getArtworkIdFromCode(hash) as ArtworkId;
      if (!artworkId) {
        console.error(`Invalid artwork hash: ${hash}`);
        return;
      }

      const viewedArtworksList = viewedArtworks ?? [];
      if (!viewedArtworksList?.includes(artworkId)) {
        setViewedArtworks([...viewedArtworksList, artworkId]);
        setShouldShowArtworkUnlocked(true);
        // we need to check the submission count here to determine which modal to show
        if (
          regularArtworks?.length === ARTWORKS_LENGTH - 1 &&
          !artworkId.startsWith("bonus") &&
          !hasViewedCongrats
        ) {
          try {
            const isLimitReached = await hasHitSubmissionLimit();
            if (isLimitReached) {
              setLimitReached(isLimitReached);
            }
          } catch (submissionLimitError) {
            console.error("Error checking submission limit:", submissionLimitError);
          }
        }
      }

      await loadArtwork(artworkId);
      setCurrentArtwork(artworkId);
      setArtworkState(ArtworkState.VIEWING);
    } catch (error) {
      console.error("Failed to load artwork:", error);
    } finally {
      setLoadingArtwork(false);
    }
  }, [loadArtwork, hash, setLoadingArtwork, setCurrentArtwork, setArtworkState, viewedArtworks, setViewedArtworks, hasViewedCongrats, regularArtworks, hasHitSubmissionLimit]);


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
    (artworkState === ArtworkState.VIEWING || artworkState === ArtworkState.NONE);

  const handleCloseArtworkUnlockedModal = useCallback(() => {
    setShowArtworkUnlocked(false);
    setShouldShowArtworkUnlocked(false);
    if (regularArtworks!.length == ARTWORKS_LENGTH && !hasViewedCongrats) {
      setShowCongratsModal(true);
      renderer?.pauseTracking();
    }
    if (artworkState === ArtworkState.NONE && hasViewedCongrats) {
      setArtworkState(ArtworkState.PLACING);
      renderer?.resumeTracking();

    }
  }, [setShowArtworkUnlocked, hasViewedCongrats, regularArtworks, artworkState, setArtworkState, renderer]);

  const handleEnterDetails = useCallback(() => {
    setShowCongratsModal(false);
    setIsSurveyOpen(true);
    setHasViewedCongrats(true);
  }, [setIsSurveyOpen, setHasViewedCongrats]);

  const shouldRendererPause = useMemo(() => {
    return (
      appState === AppState.ONBOARDING ||
      recordingState.state === 'ready'
      // (screenOrientation?.includes('landscape') && isMobile)
    );
  }, [appState, recordingState]);

  useEffect(() => {
    return shouldRendererPause ? renderer?.pauseTracking() : renderer?.resumeTracking();
  }, [shouldRendererPause, renderer]);

  const handleOnboardingClose = () => {
    setHasViewedOnboarding(true);
    setAppState(AppState.ARTWORK_VIEWING);
    setArtworkState(ArtworkState.PLACING);
  }

  const handleThankYouClose = useCallback(() => {
    setShowThankYouModal(false);
    if (artworkState === ArtworkState.NONE) {
      setArtworkState(ArtworkState.PLACING);
      renderer?.resumeTracking();
    }
    if (artworkState === ArtworkState.VIEWING && !isHeaderOpen) {
      renderer?.resumeTracking();

    }
  }, [artworkState, setShowThankYouModal, setArtworkState, renderer,  isHeaderOpen]);

  const [error] = useErrorBoundary();

  useEffect(() => {
    console.log('limitReached', limitReached)
  }, [limitReached])

  useEffect(() => {
    console.log('artworkStateChange', artworkState)
  }, [artworkState])

  useEffect(() => {
    console.log('appStateChange', appState)
  }, [appState])
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
      <FadeTransition show={appState === AppState.ONBOARDING} duration={500}>
        <div className="h-full w-full">
          <OnboardingModals onClose={handleOnboardingClose} />
        </div>
      </FadeTransition>
      <FadeTransition show={appState === AppState.ARTWORK_VIEWING}>
        <div className="h-full w-full">
          {artworkState === ArtworkState.PLACING && (
            <TrackingOverlay onStatusNormal={handleLoadArtwork} />
          )}
          {
            loadingArtwork && artworkState === ArtworkState.LOADING && (
              <div className="bg-black bg-opacity-75 h-full w-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2">
                  <Spinner />
                </div>
              </div>
            )}
        </div>
      </FadeTransition>
      <FadeTransition show={appState !== AppState.SPLASH}>
        <div className="absolute top-0 w-full z-10">
          <Header />
        </div>
      </FadeTransition>
      <FadeTransition show={showArtworkUnlockedModal}>
        <div className="w-full h-full">
          <ModalOverlay>
            <Modal className="centered h-fit bg-[#EA81A4] px-6 xs:px-8 py-12 flex justify-center items-center">
              <div className="flex flex-col gap-8 items-center w-full">
                {currentArtworkModel?.unlockedInfo && <img src={Star} className="absolute -top-9 left-1/2 -translate-x-1/2 z-10" />}
                <h2 className="text-2xl text-center font-secondary-sans">{currentArtworkModel?.artist}<br /> Unlocked!</h2>
                {currentArtworkModel?.unlockedLogo && (<img src={currentArtworkModel?.unlockedLogo} className="" />)}
                {currentArtworkModel?.unlockedInfo && <p className="leading-[20px] text-center" dangerouslySetInnerHTML={{ __html: currentArtworkModel?.unlockedInfo ?? '' }}></p>}
                <button
                  className="px-4 py-2 border-white border-2 max-w-[230px] h-14 w-full text-white rounded-full font-secondary-sans text-lg"
                  onClick={handleCloseArtworkUnlockedModal}
                >
                  <span className="block pt-[2px]">OK</span>

                </button>
              </div>
            </Modal>
          </ModalOverlay>
        </div>
      </FadeTransition>

      <FadeTransition show={appState === AppState.ARTWORK_VIEWING && artworkState === ArtworkState.VIEWING} duration={500}>
        <div className="flex fixed bottom-4 left-1/2 justify-center items-center w-full h-full -translate-x-1/2 max-w-[94px] max-h-[94px] z-[1]">
          <RecordingButton recordingState={recordingState} />
        </div>
      </FadeTransition>

      <FadeTransition show={appState === AppState.MEDIA_SHARE}>
        <div className="w-full h-full">
          <MediaPreview recordingState={recordingState} onVideoCleared={onVideoCleared} />
        </div>
      </FadeTransition>


      <FadeTransition show={showCongratsModal}>
        <div className="w-full h-full">
          <ModalOverlay>
            <Modal className="centered h-fit bg-[#EA81A4] px-6 xs:px-8 py-10 xs:py-12 flex justify-center xitems-center max-h-[655px]">
              <div className="flex flex-col items-center xjustify-center gap-5 xs:gap-7 xoverflow-scroll">
                <img src={CongratsStars} className="absolute -top-10 xs:-top-12 left-1/2 -translate-x-1/2 max-w-[160px] xs:max-w-[195px] w-full h-auto" />
                <h2 className="text-xl sm:text-2xl text-center font-secondary-sans">Congratulations!</h2>
                <img src={CongratsLogo} className="w-[100px] xs:w-[140px] h-auto" />
                {limitReached ?
                  <p className="text-sm xs:text-base leading-[18px] xs:leading-[20px] text-center">
                    You have unlocked all the Subiaco Twilight Trail experiences!
                    <br /><br />
                    To go in the draw to win a year's worth of FREE ice-cream from Whisk Creamery valued at over $1,000 or one of four runner up merch packs, simply complete the following short survey.
                    <br /><br />

                    To stay up to date visit <a href="https://seesubiaco.com.au/" target="_blank" className="underline active:opacity-75">seesubiaco.com.au</a>
                  </p>
                  :
                  <p className="text-sm xs:text-base leading-[18px] xs:leading-[20px] text-center">
                    You have unlocked all the Subiaco Twilight Trail experiences and won yourself a free ice-cream at Whisk Creamery Subiaco!
                    <br /><br />
                    To claim your prize PLUS go in the draw to win a year's worth of FREE ice-cream from Whisk Creamery valued at over $1,000 or one of four runner up merch packs, simply complete the following short survey then present the confirmation screen in store (screenshots not permitted).
                    <br /><br />
                    To stay up to date visit <a href="https://seesubiaco.com.au/" target="_blank" className="underline active:opacity-75">seesubiaco.com.au</a>
                  </p>
                }
                <button
                  className="px-4 py-2 border-white border-2 max-w-[220px] xs:max-w-[240px] h-12 xs:h-14 w-full text-white rounded-full font-secondary-sans text-base xs:text-lg"
                  onClick={handleEnterDetails}
                >
                  <span className="block pt-[2px]">
                    Enter your details
                  </span>
                </button>

              </div>
            </Modal>
          </ModalOverlay>
        </div>
      </FadeTransition>

      <FadeTransition show={showThankYouModal}>
        <div className="w-full h-full absolute inset-0">
          <ModalOverlay>
            <Modal className="centered h-fit bg-[#EA81A4] px-6 py-16 flex justify-center items-center">
              <div className="flex flex-col items-center xjustify-center gap-5 xs:gap-7 xoverflow-scroll">
                <h2 className="text-xl sm:text-2xl text-center font-secondary-sans">Thank You!</h2>
                {limitReached ?
                  <p className="text-sm xs:text-base leading-[18px] xs:leading-[20px] text-center">
                    We hope you enjoyed the Twinkling Treasure Hunt as part of the Subiaco Twilight Trail!
                    <br /><br />
                    Please present this screen at Whisk Creamery to claim a free ice-cream to the value of $6.50. You are also in the draw to win a year's worth of free ice-cream from Whisk Creamery. Winners will be contacted on 6 January.
                    <br /><br />
                    To stay up to date visit <a href="https://seesubiaco.com.au/" target="_blank" className="underline active:opacity-75">seesubiaco.com.au</a>
                  </p>
                  :
                  <p className="text-sm xs:text-base leading-[18px] xs:leading-[20px] text-center">
                    We hope you enjoyed the Twinkling Treasure Hunt as part of the Subiaco Twilight Trail!
                    <br /><br />
                    You are now in the draw to win a year's worth of free ice-cream from Whisk Creamery or one of four merch packs. Winners will be contacted on 6 January.
                    <br /><br />
                    To stay up to date visit <a href="https://seesubiaco.com.au/" target="_blank" className="underline active:opacity-75">seesubiaco.com.au</a>
                  </p>
                }
                <button
                  className="px-4 py-2 border-white border-2 max-w-[220px] xs:max-w-[240px] h-12 xs:h-14 w-full text-white rounded-full font-secondary-sans text-base xs:text-lg"
                  onClick={handleThankYouClose}
                >
                  <span className="block pt-[2px]">
                    OK
                  </span>
                </button>

              </div>
            </Modal>
          </ModalOverlay>
        </div>
      </FadeTransition>
    </div>
  );
}
