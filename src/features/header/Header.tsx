import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { ARTWORKS_LENGTH, ArtworkId, ArtworkModel } from '../../renderer/artworks';
import clsx from 'clsx';
import { HeaderBody } from './HeaderBody';
import { HeaderTitle } from './HeaderTitle';
import { Modal } from '../../components/Modal/Modal';
import { VideoRecorderResult } from '../recording-button';
import ArtworkPopup from '../artwork-popup';
import { RendererState, RepositioningState } from '../../app';
import { FadeTransition } from '../../components/Transitions';
import { ZoomPanPinch } from '../../components/ZoomPanPinch';
import { MapViewer } from './MapViewer';

export type HeaderProps = {
    viewedArtworks: ArtworkId[];
    currentArtwork: ArtworkId | undefined;
    currentArtworkModel: ArtworkModel | undefined;
    onArtworkTapped: (model: ArtworkModel, artworkId: ArtworkId) => void;
    tappedArtwork: ArtworkModel | undefined;
    onClearViewedArtworks: () => void;
    showArtworkClue: boolean;
    onTapHeader: (artworkId: ArtworkId) => void;
    onClearCurrentArtwork: () => void;
    recordingState: VideoRecorderResult;
    onToggleHeader: () => void;
    isHeaderOpen: boolean;
    rendererState: RendererState;
    handleRepositionArtwork: () => void;
    repositioningState: RepositioningState;
};

export function Header({
    viewedArtworks,
    currentArtwork,
    currentArtworkModel,
    onArtworkTapped,
    tappedArtwork,
    onClearViewedArtworks,
    showArtworkClue,
    onClearCurrentArtwork,
    recordingState,
    onToggleHeader,
    isHeaderOpen,
    rendererState,
    handleRepositionArtwork,
    repositioningState,
}: HeaderProps) {
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const onMapVisible = useCallback(() => {
        setIsMapOpen((isOpen) => !isOpen);
    }, [setIsMapOpen]);

    const [infoModalType, setInfoModalType] = useState<'terms' | 'privacy' | undefined>(undefined);
    const onShowInfoModal = (type: 'terms' | 'privacy') => {
        setInfoModalType(type);
    };
    const onRepositionClick = () => {
        handleRepositionArtwork();
    };

    const onToggleArtworkPopup = (e: Event) => {
        e.stopPropagation();
        setIsPopupOpen(!isPopupOpen);
    };

    const scrollElement = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!isHeaderOpen) {
            setTimeout(() => {
                if (scrollElement.current) scrollElement.current.scrollTop = 0;
            }, 250);
        } else {
            if (isPopupOpen) setIsPopupOpen(false);
        }
    }, [isHeaderOpen, scrollElement, isPopupOpen]);

    useEffect(() => {
        const handleVisiblityChange = () => {
            if (document.visibilityState === 'visible') {
            } else {
                setIsPopupOpen(false);
                setIsMapOpen(false);
            }
        };
        window.addEventListener('visibilitychange', handleVisiblityChange);
        return () => {
            window.removeEventListener('visibilitychange', handleVisiblityChange);
        };
    }, []);

    return (
        <div
            className={clsx('header-child relative top-0 w-full z-10 bg-gray-100 Header pointer-events-auto', {
                'animate-slide-down': recordingState.state === 'none',
                'animate-slide-up': recordingState.state !== 'none',
            })}
        >
            <HeaderTitle />

            {isMapOpen && (
                <div className="fixed z-50 h-full w-full bg-cb-blue-950 animate-fade-in">
                    <ZoomPanPinch>
                        <MapViewer />
                    </ZoomPanPinch>

                    <button
                        className="fixed bottom-10 z-50 left-1/2 -translate-x-1/2 active:text-cb-green-500"
                        onClick={onMapVisible}
                    >
                        <svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
                            <rect
                                className="fill-current text-cb-green-500 active:text-white"
                                width="56"
                                height="56"
                                rx="28"
                                fill="#003EE3"
                            />
                            <path
                                className="stroke-current"
                                d="M22 22L34 34"
                                strokeWidth="2"
                                strokeLinecap="square"
                                stroke="white"
                            />
                            <path
                                className="stroke-current"
                                d="M34 22L22 34"
                                strokeWidth="2"
                                strokeLinecap="square"
                                stroke="white"
                            />
                        </svg>
                    </button>
                </div>
            )}
            <div
                className="px-5 py-4 w-full bg-[#11d398] bg-[length:100%_160%] bg-center flex justify-between items-end cursor-pointer box-border border-b-[0.5px] border-orchid-500"
                onClick={onToggleHeader}
            >
                <h2 className="-mb-2 text-[18px] font-bold tracking-[1px] leading-none">
                    <span className="pr-1 text-4xl font-extrabold leading-none">{viewedArtworks.length}</span> OF{' '}
                    <span className="px-1 text-4xl font-extrabold leading-none">{ARTWORKS_LENGTH}</span> FOUND
                </h2>
                <p className="flex items-center -mb-2 font-base tracking-[1px] font-bold">
                    TAP TO {isHeaderOpen ? 'CLOSE' : 'OPEN'}
                    <span className="px-[3px]"></span>
                    <span className={clsx('transition-transform duration-500 mb-[6px]', { 'rotate-180': isHeaderOpen })}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M13 13L1 12.9999M13 13L13 7L13 1M13 13L2 2"
                                stroke="#82FFD9"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                </p>
            </div>
            {currentArtworkModel && (
                <FadeTransition
                    show={
                        rendererState === RendererState.VIEWING ||
                        repositioningState === RepositioningState.HAS_REPOSITIONED
                    }
                    duration={500}
                >
                    <div className="absolute pointer-events-none w-full -z-10">
                        <div className="relative z-10">
                            <ArtworkPopup
                                currentArtworkModel={currentArtworkModel}
                                isPopupOpen={isPopupOpen}
                                onToggleArtworkPopup={onToggleArtworkPopup}
                            />
                        </div>
                        {!isPopupOpen && (
                            <div
                                className="flex flex-col items-end p-4 pointer-events-auto"
                                onClick={onRepositionClick}
                            >
                                <div className="flex flex-col gap-y-2 justify-center items-center">
                                    <svg
                                        width="44"
                                        height="44"
                                        viewBox="0 0 44 44"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <circle
                                            cx="22"
                                            cy="22"
                                            r="21.5"
                                            fill={
                                                repositioningState === RepositioningState.IS_REPOSITIONING
                                                    ? 'white'
                                                    : 'black'
                                            }
                                            fillOpacity={
                                                repositioningState === RepositioningState.IS_REPOSITIONING ? '1' : '0.4'
                                            }
                                            stroke="white"
                                        />
                                        <path
                                            d="M22 10.5L22 33.5M33.5 22H10.5"
                                            stroke={
                                                repositioningState === RepositioningState.IS_REPOSITIONING
                                                    ? '#4C4B46'
                                                    : 'white'
                                            }
                                            strokeWidth="1.5"
                                            strokeLinecap="square"
                                        />
                                        <path
                                            d="M26 14L22 10L18 14"
                                            stroke={
                                                repositioningState === RepositioningState.IS_REPOSITIONING
                                                    ? '#4C4B46'
                                                    : 'white'
                                            }
                                            strokeWidth="1.5"
                                            strokeLinecap="square"
                                        />
                                        <path
                                            d="M18 30L22 34L26 30"
                                            stroke={
                                                repositioningState === RepositioningState.IS_REPOSITIONING
                                                    ? '#4C4B46'
                                                    : 'white'
                                            }
                                            strokeWidth="1.5"
                                            strokeLinecap="square"
                                        />
                                        <path
                                            d="M30 26L34 22L30 18"
                                            stroke={
                                                repositioningState === RepositioningState.IS_REPOSITIONING
                                                    ? '#4C4B46'
                                                    : 'white'
                                            }
                                            strokeWidth="1.5"
                                            strokeLinecap="square"
                                        />
                                        <path
                                            d="M14 18L10 22L14 26"
                                            stroke={
                                                repositioningState === RepositioningState.IS_REPOSITIONING
                                                    ? '#4C4B46'
                                                    : 'white'
                                            }
                                            strokeWidth="1.5"
                                            strokeLinecap="square"
                                        />
                                    </svg>
                                    <span className="text-shadow-base font-bold text-sm tracking-[0.4px]">
                                        POSITION
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </FadeTransition>
            )}

            {/* {infoModalType !== undefined && (
                <InfoModal type={infoModalType} onClose={() => setInfoModalType(undefined)} />
            )} */}
            <div
                ref={scrollElement}
                className={clsx('header-bar w-full transition-[max-height] duration-500 bg-cb-dark-purple-950', {
                    'max-h-0 overflow-hidden': !isHeaderOpen,
                    'max-h-[calc(100dvh-112px)] overflow-scroll': isHeaderOpen,
                    // 'max-h-[calc(100dvh-112px)] overflow-hidden fixed': isHeaderOpen && infoModalType,
                })}
            >
                <HeaderBody
                    viewedArtworks={viewedArtworks}
                    currentArtwork={currentArtwork}
                    onArtworkTapped={onArtworkTapped}
                    tappedArtwork={tappedArtwork}
                    onClearViewedArtworks={onClearViewedArtworks}
                    onMapVisible={onMapVisible}
                    showArtworkClue={showArtworkClue}
                    onClearCurrentArtwork={onClearCurrentArtwork}
                    onToggleHeader={onToggleHeader}
                    onShowInfoModal={onShowInfoModal}
                />
            </div>
        </div>
    );
}

// type InfoModalProps = {
//     type: 'terms' | 'privacy';
//     onClose: () => void;
// };
// function InfoModal({ type, onClose }: InfoModalProps) {
//     return (
//         <div className="fixed top-0 w-full h-full z-[100] animate-fade-in">
//             <Modal
//                 className="overflow-scroll py-10 px-5 rounded-none bg-cb-blue-950"
//                 maxWidth="max-w-full"
//                 maxHeight="max-h-full"
//             >
//                 {type === 'terms' && (
//                     <>
//                         <div className="flex justify-between items-center pb-8">
//                             <h2 className="text-xl text-white">Terms and Conditions</h2>
//                             <button className="" onClick={onClose}>
//                                 <svg
//                                     width="14"
//                                     height="15"
//                                     viewBox="0 0 14 15"
//                                     fill="none"
//                                     xmlns="http://www.w3.org/2000/svg"
//                                 >
//                                     <path d="M1 1.5L13 13.5" stroke="white" strokeWidth="2" />
//                                     <path d="M13 1.5L0.999999 13.5" stroke="white" strokeWidth="2" />
//                                 </svg>
//                             </button>
//                         </div>
//                         <p className="text-sm font-light text-cb-iron-300">
//                             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sed ultricies ipsum, at
//                             sodales urna. Ut sagittis arcu non consectetur condimentum. Sed tincidunt ante eu nisi
//                             varius, placerat posuere ante dictum. Aenean id est vel justo faucibus ullamcorper id eget
//                             dolor. Vivamus ut justo orci. Duis venenatis nisl quis consectetur laoreet. Fusce nec nunc
//                             nunc. Donec vehicula, nunc sed facilisis hendrerit, urna massa ornare dolor, eu pellentesque
//                             lacus metus at elit. Quisque convallis maximus odio, ac tempor enim sodales in.
//                             <br />
//                             <br />
//                             Nam scelerisque tellus a arcu ullamcorper eleifend. Donec tincidunt augue vitae ultricies
//                             lobortis. Aenean vel laoreet ipsum, sit amet mollis est. Donec eget magna et arcu commodo
//                             suscipit. Fusce tristique lectus vel leo sodales, sed posuere justo luctus. Fusce quis diam
//                             vel turpis posuere bibendum. Aliquam ac leo in urna vulputate euismod.
//                             <br />
//                             <br />
//                             Duis mollis nisl vitae nisi consectetur congue. Phasellus a pellentesque arcu. Donec finibus
//                             et diam eget sollicitudin. Etiam vel nisi in leo lobortis varius dictum at ligula. Etiam a
//                             quam at libero posuere ultrices. Praesent accumsan vestibulum pulvinar. Mauris blandit, nisi
//                             eget mattis tincidunt, ex libero auctor ante, nec convallis tellus magna id augue. Sed ac
//                             lobortis dolor. Aenean eros nibh, sollicitudin et urna quis, rutrum mattis massa. Maecenas
//                             gravida, ante nec luctus suscipit, arcu nisi pretium mauris, et porta magna nisi sit amet
//                             ligula. Proin pellentesque lacus nisi, sed laoreet velit laoreet ac.
//                             <br />
//                             <br />
//                             <br />
//                         </p>
//                     </>
//                 )}
//                 {type === 'privacy' && (
//                     <>
//                         <div className="flex justify-between items-center pb-8">
//                             <h2 className="text-xl text-white">Privacy Policy</h2>
//                             <button className="" onClick={onClose}>
//                                 <svg
//                                     width="14"
//                                     height="15"
//                                     viewBox="0 0 14 15"
//                                     fill="none"
//                                     xmlns="http://www.w3.org/2000/svg"
//                                 >
//                                     <path d="M1 1.5L13 13.5" stroke="white" strokeWidth="2" />
//                                     <path d="M13 1.5L0.999999 13.5" stroke="white" strokeWidth="2" />
//                                 </svg>
//                             </button>
//                         </div>
//                         <p className="text-sm font-light text-cb-iron-300">
//                             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sed ultricies ipsum, at
//                             sodales urna. Ut sagittis arcu non consectetur condimentum. Sed tincidunt ante eu nisi
//                             varius, placerat posuere ante dictum. Aenean id est vel justo faucibus ullamcorper id eget
//                             dolor. Vivamus ut justo orci. Duis venenatis nisl quis consectetur laoreet. Fusce nec nunc
//                             nunc. Donec vehicula, nunc sed facilisis hendrerit, urna massa ornare dolor, eu pellentesque
//                             lacus metus at elit. Quisque convallis maximus odio, ac tempor enim sodales in.
//                             <br />
//                             <br />
//                             Nam scelerisque tellus a arcu ullamcorper eleifend. Donec tincidunt augue vitae ultricies
//                             lobortis. Aenean vel laoreet ipsum, sit amet mollis est. Donec eget magna et arcu commodo
//                             suscipit. Fusce tristique lectus vel leo sodales, sed posuere justo luctus. Fusce quis diam
//                             vel turpis posuere bibendum. Aliquam ac leo in urna vulputate euismod.
//                             <br />
//                             <br />
//                             Duis mollis nisl vitae nisi consectetur congue. Phasellus a pellentesque arcu. Donec finibus
//                             et diam eget sollicitudin. Etiam vel nisi in leo lobortis varius dictum at ligula. Etiam a
//                             quam at libero posuere ultrices. Praesent accumsan vestibulum pulvinar. Mauris blandit, nisi
//                             eget mattis tincidunt, ex libero auctor ante, nec convallis tellus magna id augue. Sed ac
//                             lobortis dolor. Aenean eros nibh, sollicitudin et urna quis, rutrum mattis massa. Maecenas
//                             gravida, ante nec luctus suscipit, arcu nisi pretium mauris, et porta magna nisi sit amet
//                             ligula. Proin pellentesque lacus nisi, sed laoreet velit laoreet ac.
//                             <br />
//                             <br />
//                             <br />
//                         </p>
//                     </>
//                 )}
//             </Modal>
//         </div>
//     );
// }
