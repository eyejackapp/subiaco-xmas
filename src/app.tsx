import 'preact/debug';
import { useCallback, useEffect, useErrorBoundary, useMemo, useRef, useState } from 'preact/hooks';
import { RendererApi, initExperienceRenderer } from './renderer';
import { ARTWORKS, ARTWORK_ARRAY, ArtworkId, ArtworkModel } from './renderer/artworks';
import { useLocalStorageState } from 'ahooks';
import Header from './features/header';
import Splash from './features/splash';
import { OnboardingModals } from './features/onboarding';
import { DebugMenu, DebugMenuState } from './features/debug';
import { isMobile } from './utils/getUserDevice';
import { RecordingButton, useVideoRecorder } from './features/recording-button';
import NotificationBar from './features/notification-bar';
import { QRProcessEvents } from './renderer/8thwall/qr-process-pipeline-module';
import ArtworkPopup from './features/artwork-popup';
import useScreenOrientation from './hooks/useScreenOrientation';
import LandscapeOverlay from './features/landscape-overlay';
import TrackingOverlay from './features/tracking-overlay';
import { FadeTransition } from './components/Transitions';
import InstructionsOverlay from './features/instructions-overlay';
import ReactGA from 'react-ga4';
import { Modal } from './components/Modal';
import { createPortal } from 'preact/compat';
import MediaPreview from './features/media-preview';
import useUserDevice from './hooks/useUserDevice';
import CongratsLogo from './assets/congrats-logo.webp';
import WatermarkFile from './assets/watermark-logo.png';
import ArtworkLeft from './assets/sprite-left.png';
import ArtworkRight from './assets/sprite-right.png';
import Spinner from './components/Spinner';
import { modelDirection } from 'three/webgpu';
import ErrorPage from './features/error';

export type AppError = {
    title: string;
    message: string;
};

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

const hideRecordButton = new URLSearchParams(location.search).has('hide_record');

export function App() {
    // Debug Menu
    const isDebug = import.meta.env.VITE_DEBUG; // Set the environment VITE_DESKTOP_DEBUG to view as non 8thwall

    // Debug state
    const [currentDebugState, setCurrentDebugState] = useState<DebugMenuState>(DebugMenuState.CLOSED);
    const setDebugState = useCallback(
        (state: DebugMenuState) => {
            setCurrentDebugState(state);
        },
        [setCurrentDebugState],
    );

    // Mount the 8thwall experience (this will block the UI with 8thwalls
    // loading / permissions screens).
    const [renderer, setRenderer] = useState<RendererApi>();
    const [hasViewedOnboarding, setHasViewedOnboarding] = useLocalStorageState('hasViewedOnboarding', {
        defaultValue: false,
    });
    const [hasViewedCongrats, setHasViewedCongrats] = useLocalStorageState('hasViewedCongrats', {
        defaultValue: false,
    });
    const [loadArtworkOnStart, setLoadArtworkOnStart] = useState(false);
    const initExperience = async () => {
        if (!isMobile) return;
        setIsLoadingExperience(true);
        setPermissionGranted(true);
        const canvasEl = document.getElementById('xr-canvas') as HTMLCanvasElement;
        if (!canvasEl) throw new Error('No Canvas element.');
        const renderer = await initExperienceRenderer(canvasEl, {
            watermarkImageUrl: hideRecordButton ? '' : WatermarkFile,
        });
        setRenderer(renderer);
        setTimeout(() => {
            setIsLoadingExperience(false);
            if (hasViewedOnboarding) {
                setLoadArtworkOnStart(true);
            } else {
                setShowOnboardingModal(true);
            }
        }, 1000);
    };

    /**
     * App State
     */
    const screenOrientation = useScreenOrientation();
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [currentArtwork, setCurrentArtwork] = useState<ArtworkId | undefined>(
        // After twitter login, need to return to the viewed artwork.
        (localStorage.getItem('pre-signup-artwork') as ArtworkId) ?? undefined,
    );
    const currentArtworkModel = useMemo(
        () => (currentArtwork ? ARTWORKS[currentArtwork] : undefined),
        [currentArtwork],
    );

    const [progress, setProgress] = useState(0);
    const [viewedArtworks, setViewedArtworks] = useLocalStorageState<ArtworkId[]>('viewedArtworks', {
        defaultValue: [],
    });
    const [tappedArtwork, setTappedArtwork] = useState<ArtworkModel>();
    const [showArtworkClue, setShowArtworkClue] = useState(false);
    const [showArtworkUnlocked, setShowArtworkUnlocked] = useState(false);
    const [showOnboardingModal, setShowOnboardingModal] = useState(false);
    const [isLoadingExperience, setIsLoadingExperience] = useState(false);
    const [showHeaderUi, setShowHeaderUi] = useState(false);
    const [showRecordingButton, setShowRecordingButton] = useState(false);
    const [isHeaderOpen, setIsHeaderOpen] = useState(false);
    const [mediaVisible, setMediaVisible] = useState(false);
    const [artworkHelperMode, setArtworkHelperMode] = useState<'left' | 'right' | 'none'>();
    const [qrCodeFound, setqrCodeFound] = useState(true);
    const [rendererState, setRendererState] = useState(RendererState.NONE);
    const [repositioningState, setRepositioningState] = useState(RepositioningState.NONE);
    const [showTrackingOverlay, setShowTrackingOverlay] = useState(false);
    const [showCompletedModal, setShowCompletedModal] = useState(false);
    const [canShowCongratulationsModal, setCanShowCongratulationsModal] = useState(false);
    const [isLoadingArtwork, setIsLoadingArtwork] = useState(false);
    const [trackingStatus, setTrackingStatus] = useState<'show' | 'hide'>(
        'show',
    );
    const { device } = useUserDevice();
    const clearCurrentArtwork = useCallback(() => {
        if (!renderer) throw new Error(`clearArtwork() but no experience loaded.`);
        // renderer.clearArtwork();
        setRepositioningState(RepositioningState.NONE);
    }, [renderer]);

    /**
     * Tells the Renderer to load a specific artwork via the id and
     * (TODO:) also updates internal state to track that artwork as viewed.
     */
    const loadArtwork = useCallback(
        async (artworkId: ArtworkId) => {
            console.debug(`loadArtwork(${artworkId})`);
            renderer?.pauseAudio();
            setRendererState(RendererState.REPOSITIONING);
            setRepositioningState(RepositioningState.NONE);
            canResumeAudio.current = false;
            // clearCurrentArtwork();
            setCurrentArtwork(artworkId);

            if (viewedArtworks && !viewedArtworks.includes(artworkId)) {
                // setShowArtworkUnlocked(true);
                setViewedArtworks((viewedArtworks) => [...viewedArtworks!, artworkId]);
            
            }
            if (!renderer) throw new Error(`loadArtwork(${artworkId}) but no experience loaded.`);
            await renderer.loadArtwork(artworkId);
        },
        [renderer, viewedArtworks, setViewedArtworks],
    );

    const loadArtworkFromUrl = useCallback(() => {
        // load artwork if url contains artwork id
        if (window.location.hash) {
            const artworkNumber = location.hash.split('#').pop() as ArtworkId;
            if (artworkNumber && !validCodeRegex.test(artworkNumber)) return;
            const artworkId = QR_CODE_LOOKUP[
                artworkNumber as '9734' | '6495' | '8719' | '4842' | '1425' | '3274' | '9806' | '7730'
            ] as ArtworkId;
            loadArtwork(artworkId);

            // // Need to clear media if video already present but it's for a different artwork.
            // const preSignupArtwork = localStorage.getItem('pre-signup-artwork');
            // if (preSignupArtwork !== artworkId && recordingState.state === 'ready') {
            //     recordingState.clear();
            // }

            // give a moment for header to drop down before loading and showing notification
            // setTimeout(() => {
            // }, 500);
        }
    }, [loadArtwork]);

    const canResumeAudio = useRef(false);
    useEffect(() => {
        const handleHashChange = () => {
            console.log('HASH CHANGE', currentArtwork);
            if (currentArtwork) clearCurrentArtwork();
            loadArtworkFromUrl();
        };
        const handleVisiblityChange = () => {
            if (document.visibilityState === 'visible') {
                const artworkNumber = location.hash.split('#').pop() as ArtworkId;
                const artworkId = QR_CODE_LOOKUP[
                    artworkNumber as '9734' | '6495' | '8719' | '4842' | '1425' | '3274' | '9806' | '7730'
                ] as ArtworkId;
                console.log('vis change', currentArtwork, artworkId);
                if (currentArtwork !== artworkId) {
                    window.location.reload();
                }

                if (canResumeAudio.current) renderer?.resumeAudio();
            } else {
                renderer?.pauseAudio();
                canResumeAudio.current = true;
                setIsHeaderOpen(false);
            }
        };
        window.addEventListener('visibilitychange', handleVisiblityChange);
        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('visibilitychange', handleVisiblityChange);
        };
    }, [loadArtworkFromUrl, currentArtwork, clearCurrentArtwork, renderer, rendererState]);

    useEffect(() => {
        if (loadArtworkOnStart) {
            loadArtworkFromUrl();
        }
    }, [loadArtworkOnStart]);

    /**
     * Integrate renderer events with react state.
     */

    useEffect(() => {
        if (!renderer) return;

        const handleProgressLoad = (progress: number) => {
            setProgress(progress);
        };

        const handleLoaded = () => {
            setRendererState(RendererState.LOADED);
            setIsLoadingArtwork(false);
        };

        const handleQRFound = (model: QRProcessEvents['qr-scan-result']) => {
            if (qrCodeFound && model.status === 'found') {
                const artworkNumber = model.data.split('#').pop();
                if ((artworkNumber && !validCodeRegex.test(artworkNumber)) || showTrackingOverlay) return;
                location.hash = artworkNumber as string;
            }
            model.status === 'found' ? setqrCodeFound(false) : setqrCodeFound(true);
        };

        const handleRepositioning = () => {
            setRendererState(RendererState.REPOSITIONING);
        };

        const handlePlaced = () => {
            setRendererState(RendererState.PLACED);
            setIsLoadingArtwork(true);
        };

        const handleTrackingStatus = (e: string) => {
            setTrackingStatus(e);
        };

        const handleArtworkHelperChange = (e: 'left' | 'right' | 'none') => {
            setArtworkHelperMode(e);
        };

        renderer.on('content-placed', handlePlaced);
        renderer.on('content-repositioning', handleRepositioning);
        renderer.on('content-load-progress', handleProgressLoad);
        renderer.on('content-loaded', handleLoaded);
        renderer.on('qr-scan-result', handleQRFound);
        renderer.on('trackingStatus', handleTrackingStatus);
        renderer.on('on-artwork-helper-change', handleArtworkHelperChange);

        return () => {
            renderer.off('content-placed', handlePlaced);
            renderer.on('content-repositioning', handleRepositioning);
            renderer.off('content-load-progress', handleProgressLoad);
            renderer.off('content-loaded', handleLoaded);
            renderer.off('qr-scan-result', handleQRFound);
            renderer.off('trackingStatus', handleTrackingStatus);
            renderer.off('on-artwork-helper-change', handleArtworkHelperChange);
        };
    }, [renderer, qrCodeFound, loadArtwork, showTrackingOverlay]);
    useEffect(() => {
        if (!renderer) return;
        const handleTrackingStatus = (e: 'show' | 'hide') => {
            setTrackingStatus(e);
            if (e === 'show') {
            }
            // if (uiStatus === 'show' && e === 'hide') {
            //     setUiStatus('hide');
            // }
        };
        renderer.on('tracking-status', handleTrackingStatus);
        return () => {
            renderer.off('tracking-status', handleTrackingStatus);
        };
    }, [renderer]);
    const getNextRepositionState = (currentState: RepositioningState) => {
        const newState = currentState + 1;
        return newState;
    };

    const handleRepositionArtwork = useCallback(() => {
        if (!renderer) return;
        if (window.XR8) XR8.XrController.recenter();
        renderer.repositionArtwork(currentArtwork);

        if (repositioningState === RepositioningState.NONE) {
            const nextState = getNextRepositionState(repositioningState);
            if (nextState) setRepositioningState(nextState);
        } else if (repositioningState === RepositioningState.HAS_REPOSITIONED) {
            setRepositioningState(RepositioningState.IS_REPOSITIONING);
        }
    }, [currentArtwork, renderer, repositioningState]);

    useEffect(() => {
        if (rendererState === RendererState.PLACED && repositioningState === RepositioningState.IS_REPOSITIONING) {
            const nextState = getNextRepositionState(repositioningState);
            if (nextState) setRepositioningState(nextState);
        }
    }, [rendererState, repositioningState]);

    const handleArtworkTap = useCallback(
        (model: ArtworkModel, artworkId: ArtworkId) => {
            setTappedArtwork(model);
            if (viewedArtworks && !viewedArtworks.includes(artworkId)) {
                setShowArtworkClue(true);
            } else {
                const artwork = Object.entries(QR_CODE_LOOKUP).find(([key, val]) => val === artworkId);
                setIsHeaderOpen(false);
                currentArtwork === artworkId ? handleRepositionArtwork() : artwork && (location.hash = artwork[0]);
            }
        },
        [setShowArtworkClue, viewedArtworks, currentArtwork, handleRepositionArtwork],
    );

    const clearViewedArtworks = useCallback(() => {
        console.debug(`clearViewedArtworks -> clearing ${viewedArtworks?.join(',')}`);
        setViewedArtworks([]);
        setCurrentArtwork(undefined);
        setTappedArtwork(undefined);
    }, [viewedArtworks, setViewedArtworks]);

    const recordingState = useVideoRecorder(renderer);

    const handleOnboardingClose = () => {
        setShowOnboardingModal(false);
        setHasViewedOnboarding(true);
        loadArtworkFromUrl();
    };

    // const shouldRendererPause = useMemo(() => {
    //     return (
    //         showOnboardingModal ||
    //         isHeaderOpen ||
    //         recordingState.state === 'ready' ||
    //         (screenOrientation?.includes('landscape') && isMobile)
    //     );
    // }, [showOnboardingModal, isHeaderOpen, recordingState, screenOrientation]);

    // useEffect(() => {
    //     if (!renderer) return;
    //     shouldRendererPause ? renderer.pause() : renderer.resume();
    // }, [shouldRendererPause, renderer]);

    const toggleHeader = useCallback(() => {
        setIsHeaderOpen((isOpen) => !isOpen);
        if (!isHeaderOpen) setShowArtworkClue(false);
    }, [setIsHeaderOpen, setShowArtworkClue, isHeaderOpen]);

    const shouldHideHeaderUi = useMemo(() => {
        return recordingState.state !== 'none' || screenOrientation?.includes('landscape') || showOnboardingModal;
    }, [recordingState, screenOrientation, showOnboardingModal]);

    useEffect(() => {
        shouldHideHeaderUi ? setShowHeaderUi(false) : setShowHeaderUi(true);
    }, [setShowHeaderUi, shouldHideHeaderUi, showHeaderUi, renderer]);

    const shouldHideRecordingButton = useMemo(() => {
        return (
            rendererState !== RendererState.VIEWING ||
            (recordingState.state === 'ready' && mediaVisible) ||
            (hideRecordButton && recordingState.state !== 'none')
        );
    }, [rendererState, recordingState, mediaVisible]);

    useEffect(() => {
        shouldHideRecordingButton ? setShowRecordingButton(false) : setShowRecordingButton(true);
    }, [shouldHideRecordingButton, setShowRecordingButton]);

    const shouldShowTrackingOverlay = useMemo(() => {
        return rendererState === RendererState.REPOSITIONING && !showArtworkUnlocked && recordingState.state === 'none';
    }, [rendererState, showArtworkUnlocked, recordingState]);

    useEffect(() => {
        shouldShowTrackingOverlay ? setShowTrackingOverlay(true) : setShowTrackingOverlay(false);
    }, [shouldShowTrackingOverlay]);

    useEffect(() => {
        if (recordingState.state === 'ready') {
            setMediaVisible(true);
        }
    }, [recordingState.state]);
    const onVideoCleared = () => {
        if (recordingState.state === 'ready') {
            recordingState.clear();
            setMediaVisible(false);
            localStorage.removeItem('pre-signup-artwork');
        }
    };

    useEffect(() => {
        if (repositioningState === RepositioningState.HAS_REPOSITIONED && rendererState === RendererState.LOADED) {
            setRendererState(RendererState.VIEWING);
        }
    }, [repositioningState, rendererState]);

    // const handleCloseArtworkUnlocked = async () => {
    //     setShowArtworkUnlocked(false);
    //     if (!renderer) throw new Error(`loadArtwork(${currentArtwork}) but no experience loaded.`);
    //     if (!currentArtwork) throw new Error('no current artwork found');
    //     await renderer.loadArtwork(currentArtwork);
    // };

    const handleClosedCompletedModal = () => {
        setCanShowCongratulationsModal(false);
        setShowCompletedModal(false);
    };

    useEffect(() => {
        if (viewedArtworks?.length === 8 && !hasViewedCongrats) {
            console.log('viewed artworks = 8');
            setCanShowCongratulationsModal(true);
        }
    }, [viewedArtworks, canShowCongratulationsModal, hasViewedCongrats]);

    const handleInstructionsCompleted = useCallback(() => {
        if (rendererState !== RendererState.LOADED) return;
        setRendererState(RendererState.VIEWING);
        if (canShowCongratulationsModal) {
            setTimeout(() => {
                setShowCompletedModal(true);
                setHasViewedCongrats(true);
            }, 5000);
        }
    }, [setRendererState, canShowCongratulationsModal, setHasViewedCongrats, rendererState]);

    const [error] = useErrorBoundary();

    /**
     * JSX
     */
    if (error) {
        return <ErrorPage error={error}/>;
    }
    // if (isDebug)
    //     return (
    //         <>
    //             <DebugMenu debugStateCallback={setDebugState} />
    //             {currentDebugState === DebugMenuState.ONBOARDING && (
    //                 <OnboardingModals onClose={() => setShowOnboardingModal(false)} />
    //             )}
    //             {currentDebugState === DebugMenuState.SPLASH && (
    //                 <Splash
    //                     onPermissionsGranted={initExperience}
    //                     isLoadingExperience={isLoadingExperience}
    //                     device={device}
    //                 />
    //             )}
    //             {currentDebugState === DebugMenuState.HEADER && (
    //                 <Header
    //                     viewedArtworks={viewedArtworks!}
    //                     currentArtwork={currentArtwork}
    //                     currentArtworkModel={currentArtworkModel}
    //                     tappedArtwork={tappedArtwork}
    //                     onArtworkTapped={handleArtworkTap}
    //                     onClearViewedArtworks={clearViewedArtworks}
    //                     showArtworkClue={showArtworkClue}
    //                     onTapHeader={loadArtwork}
    //                     onClearCurrentArtwork={clearCurrentArtwork}
    //                     recordingState={recordingState}
    //                     onToggleHeader={toggleHeader}
    //                     isHeaderOpen={isHeaderOpen}
    //                     rendererState={rendererState}
    //                     handleRepositionArtwork={handleRepositionArtwork}
    //                     repositioningState={repositioningState}
    //                 />
    //             )}
    //             {currentDebugState === DebugMenuState.ARTWORK_FOUND_NOTIFICATION && (
    //                 <NotificationBar className="bg-white text-blue-violet-600">
    //                     <p className="py-4 px-5 text-center">Artwork Unlocked!</p>
    //                 </NotificationBar>
    //             )}
    //             {currentDebugState === DebugMenuState.ARTWORK_POPUP && (
    //                 <ArtworkPopup currentArtworkModel={ARTWORK_ARRAY[0]} />
    //             )}
    //             {currentDebugState === DebugMenuState.MEDIA_PREVIEW && (
    //                 <MediaPreview recordingState={recordingState} onVideoCleared={onVideoCleared} />
    //             )}
    //             {currentDebugState === DebugMenuState.CONGRATULATIONS && (
    //                 <Modal
    //                     maxWidth="max-w-[340px]"
    //                     maxHeight="max-h-[500px]"
    //                     className="bg-[url('./assets/congrats-bg.webp')] bg-cover text-white centered overflow-visible"
    //                 >
    //                     <img
    //                         className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[100px] "
    //                         src={CongratsLogo}
    //                     ></img>
    //                     <div className="flex flex-col justify-between items-center pt-16 pb-8 px-8 h-full">
    //                         <h2 className="text-xl font-500 text-left font-semibold self-start">Congratulations!</h2>
    //                         <p className="text-sm font-light text-left tracking-[1px] leading-[18px]">
    //                             Have you noticed the eight experiences are part of the Hyperreal Amble? Did you notice
    //                             the installation and wall-art?
    //                             <br />
    //                             <br />
    //                             From 6pm on 27 Jan, 15 Feb and 1 Mar, step into Incubate Studios to share your thoughts,
    //                             create with friends and strangers; pop-in to the other creative hubs -Bankstown Arts
    //                             Centre, BLaKC and Paul Keating Park.
    //                             <br />
    //                             <br />
    //                             Stay longer, dine, drink and support local! Discover more of Bankstown where creativity
    //                             lives and moves.
    //                         </p>
    //                         <button className="refraction-button" onClick={handleClosedCompletedModal}>
    //                             OK
    //                         </button>
    //                     </div>
    //                 </Modal>
    //             )}
    //         </>
    //     );
    return (
        <>
            <FadeTransition show={screenOrientation?.includes('landscape') && isMobile} duration={500}>
                <LandscapeOverlay className="flex lg:hidden" />
            </FadeTransition>
            {renderer && !isLoadingExperience ? (
                <>
                    {/* <FadeTransition show={showOnboardingModal && recordingState.state === 'none'} duration={500}>
                        <OnboardingModals onClose={handleOnboardingClose} />
                    </FadeTransition>

                    <FadeTransition show={showTrackingOverlay} duration={500}>
                        <TrackingOverlay
                            status={trackingStatus}
                            repositioningState={repositioningState}
                            renderer={renderer}
                        />
                    </FadeTransition>

                    <FadeTransition
                        show={
                            rendererState === RendererState.LOADED &&
                            repositioningState !== RepositioningState.HAS_REPOSITIONED
                        }
                        duration={500}
                    >
                        <InstructionsOverlay
                            viewedArtworks={viewedArtworks}
                            onInstructionsCompleted={handleInstructionsCompleted}
                        />
                    </FadeTransition> */}
                    {showHeaderUi && (
                        <Header
                            viewedArtworks={viewedArtworks!}
                            currentArtwork={currentArtwork}
                            currentArtworkModel={currentArtworkModel}
                            tappedArtwork={tappedArtwork}
                            onArtworkTapped={handleArtworkTap}
                            onClearViewedArtworks={clearViewedArtworks}
                            showArtworkClue={showArtworkClue}
                            onTapHeader={loadArtwork}
                            onClearCurrentArtwork={clearCurrentArtwork}
                            recordingState={recordingState}
                            onToggleHeader={toggleHeader}
                            isHeaderOpen={isHeaderOpen}
                            rendererState={rendererState}
                            handleRepositionArtwork={handleRepositionArtwork}
                            repositioningState={repositioningState}
                        />
                    )}


                    {/* {createPortal(
                        <FadeTransition show={showArtworkUnlocked} duration={500}>
                            <Modal
                                maxWidth="max-w-[390px]"
                                maxHeight="max-h-[462px]"
                                className="bg-gray-900 bg-cover text-white centered"
                            >
                                <div className="flex flex-col justify-between items-center py-12 px-8 h-full">
                                    <h2 className="text-xl font-500">Artwork Unlocked!</h2>
                                    <img
                                        className="w-28 max-w-full rounded-full border-2 z-[1] aspect-square"
                                        src={currentArtworkModel?.image}
                                    />
                                    <p className="text-sm font-light text-center tracking-[1px] leading-[18px]">
                                        You have discovered a Augmented Reality artwork by {currentArtworkModel?.artist}
                                        .
                                        <br />
                                        <br />
                                        This experience will now activate.{' '}
                                    </p>
                                </div>
                            </Modal>
                        </FadeTransition>,
                        document.body,
                    )}

                    <FadeTransition show={showRecordingButton} duration={500}>
                        <div className="flex fixed bottom-4 left-1/2 justify-center items-center w-full h-full -translate-x-1/2 max-w-[94px] max-h-[94px] z-[1]">
                            <RecordingButton recordingState={recordingState} />
                        </div>
                    </FadeTransition>

                    <FadeTransition show={mediaVisible}>
                        <MediaPreview recordingState={recordingState} onVideoCleared={onVideoCleared} />
                    </FadeTransition>

                    {createPortal(
                        <>
                            <FadeTransition
                                show={artworkHelperMode === 'left' && rendererState === RendererState.VIEWING}
                                duration={500}
                            >
                                {artworkHelperMode === 'left' && (
                                    <span className="block absolute left-0 top-1/2 -translate-y-1/4">
                                        <img src={ArtworkLeft} className="max-w-[150px] w-full" />
                                    </span>
                                )}
                            </FadeTransition>
                            <FadeTransition
                                show={artworkHelperMode === 'right' && rendererState === RendererState.VIEWING}
                                duration={500}
                            >
                                {artworkHelperMode === 'right' && (
                                    <span className="block absolute right-0 top-1/2 -translate-y-1/4">
                                        <img src={ArtworkRight} className="max-w-[150px] w-full" />
                                    </span>
                                )}
                            </FadeTransition>
                        </>,

                        document.body,
                    )}

                    {createPortal(
                        <>
                            <FadeTransition show={isLoadingArtwork} duration={500}>
                                <div className="absolute w-full h-full inset-0 bg-[rgba(0,0,0,0.5)] z-[1000] flex items-center justify-center">
                                    <span className="animate-fade-in ">
                                        <Spinner />
                                    </span>
                                </div>
                            </FadeTransition>
                        </>,
                        document.body,
                    )}

                    {createPortal(
                        <FadeTransition show={showCompletedModal} duration={500}>
                            <Modal
                                maxWidth="max-w-[340px]"
                                maxHeight="max-h-[500px]"
                                className="bg-[url('assets/congrats-bg.webp')] bg-cover text-white centered overflow-visible"
                            >
                                <img
                                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[100px] "
                                    src={CongratsLogo}
                                ></img>
                                <div className="flex flex-col justify-between items-center pt-16 pb-8 px-8 h-full">
                                    <h2 className="text-xl font-500 text-left font-bold self-start">
                                        Congratulations!
                                    </h2>
                                    <p className="text-sm text-left tracking-[1px] leading-[18px]">
                                        Have you noticed the eight experiences are part of the Hyperreal Amble? Did you
                                        notice the installation and wall-art?
                                        <br />
                                        <br />
                                        From 6pm on 27 Jan, 15 Feb and 1 Mar, step into Incubate Studios to share your thoughts, create with friends and
                                        strangers; pop-in to the other creative hubs -Bankstown Arts Centre, BLaKC and
                                        Paul Keating Park.
                                        <br />
                                        <br />
                                        Stay longer, dine, drink and support local! Discover more of Bankstown where
                                        creativity lives and moves.
                                    </p>
                                    <button className="refraction-button" onClick={handleClosedCompletedModal}>
                                        OK
                                    </button>
                                </div>
                            </Modal>
                        </FadeTransition>,
                        document.body,
                    )} */}
                </>
            ) : (
                <Splash
                    onPermissionsGranted={initExperience}
                    isLoadingExperience={isLoadingExperience}
                    device={device}
                />
            )}
        </>
    );
}
