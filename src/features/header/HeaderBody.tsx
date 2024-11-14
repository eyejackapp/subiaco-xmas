import clsx from 'clsx';
import { ARTWORK_ARRAY, ArtworkId, ARTWORKS_LENGTH } from '../../renderer/artworks';
import QuestionMark from './assets/question.svg';
import Bonus from './assets/bonus.svg';
import Star from './assets/star.svg';
import { useCallback, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat'
import { ZoomPanPinch } from '@/components/ZoomPanPinch';
import { MapViewer } from './MapViewer';
import { useArtwork } from '@/hooks/useArtwork';
import { useAppState } from '@/hooks/useAppState';
import { useUserForm } from '@/hooks/useUserForm';

export type HeaderBodyProps = {
    onToggleHeader: () => void;
    // onShowInfoModal: (type: 'terms' | 'privacy') => void;
};

export function HeaderBody({ onToggleHeader }: HeaderBodyProps) {
    const [isMapOpen, setIsMapOpen] = useState(false);

    const { regularArtworks } = useArtwork();
    const { setIsSurveyOpen } = useAppState();

    const onMapVisible = useCallback(() => {
        setIsMapOpen((isOpen) => !isOpen);
    }, [setIsMapOpen]);

    const canClaimPrize = regularArtworks && regularArtworks.length === ARTWORKS_LENGTH;

    const { hasSentData } = useUserForm();

    return (
        <div className="w-full relative bg-[#F0493C]">
            <ArtworkList />
            <span className="block h-[1px] w-full"></span>
            <Map onMapVisible={onMapVisible} />
            {isMapOpen && createPortal(
                <div className="fixed z-[1000] inset-0 pointer-events-auto h-full w-full animate-fade-in">
                    <ZoomPanPinch>
                        <MapViewer />
                    </ZoomPanPinch>

                    <button
                        className="fixed bottom-10 z-50 left-1/2 -translate-x-1/2 active:text-[#C4A056]"
                        onClick={onMapVisible}
                    >
                        <svg
                            className="group"
                            width="56"
                            height="56"
                            viewBox="0 0 56 56"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect
                                className="fill-current text-[#C4A056] group-active:text-white"
                                width="56"
                                height="56"
                                rx="28"
                                fill="black"
                            />
                            <path
                                className="stroke-current text-white group-active:text-[#C4A056]"
                                d="M22 22L34 34"
                                strokeWidth="2"
                                strokeLinecap="square"
                            />
                            <path
                                className="stroke-current text-white group-active:text-[#C4A056]"
                                d="M34 22L22 34"
                                strokeWidth="2"
                                strokeLinecap="square"
                            />
                        </svg>
                    </button>
                </div>, document.body
            )}
            <div className="w-full flex flex-col gap-4 justify-center items-center">
                <h2 className="text-base font-bold px-5 pt-5">{canClaimPrize ? 'You have unlocked all 7!' : 'Unlock all 7 for your chance to win'}</h2>
                <button onClick={() => setIsSurveyOpen(true)} className="border-2 border-white max-w-[200px] w-full px-2 py-4 rounded-md disabled:bg-gray-400" disabled={!canClaimPrize}>{hasSentData ? 'Update Details' : 'Claim your prize'}</button>
            </div>
            <Instructions />
            {/* <FAQs /> */}
            <div className="flex justify-between items-end px-5">
                <div className="text-base flex gap-4 ">
                    {/* <button className="text-xs font-[500] underline" onClick={() => onShowInfoModal('terms')}>
                        Terms & Conditions
                    </button> */}
                    <a href="https://eyejackapp.com/pages/privacy" target="_blank" rel="noreferrer">
                        <button className="text-xs font-[500] underline">Privacy Policy</button>
                    </a>
                </div>
                <div className="pb-1" onClick={onToggleHeader}>
                    <svg
                        className="rotate-180"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M13 13L1 12.9999M13 13L13 7L13 1M13 13L2 2"
                            stroke="#82FFD9"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
            <div className="py-8" />

        </div>
    );
}



function ArtworkList() {
    const { viewedArtworks, currentArtwork, setTappedArtwork, setShowArtworkUnlocked, regularArtworks } = useArtwork();

    const handleArtworkTap = useCallback(
        (artworkId: ArtworkId) => {
            setTappedArtwork(artworkId);
            console.log('handleartworktap', artworkId)
            setShowArtworkUnlocked(true);
        },
        [setShowArtworkUnlocked, setTappedArtwork],
    );
    return (
        <div className="flex sm:gap-9 gap-7 sm:p-8 p-5 flex-wrap">
            {ARTWORK_ARRAY.map((model, index) => {
                const isViewed = viewedArtworks?.includes(model.artworkId);
                const isBonus = model.artworkId.startsWith("bonus") && !isViewed;
                const hasPrize = 'unlockedInfo' in model;
                const paddedArtworkIndex = String(index + 1).padStart(2, '0');
                return (
                    <div
                        key={model.artworkId}
                        className={clsx(
                            `basis-[27%] h-full aspect-square border-2 rounded-full relative text-[10px] font-bold text-oslo-gray-400 before:content-[attr(data-before-content)] before:absolute before:-top-[2px] before:-left-[2px] before:font-number-sans active:border-opacity-50 `,
                            {
                                // 'border-2': !isCurrent,
                                // 'border-3': isCurrent,
                                'border-[#FEF0D5]': !isViewed,
                                'border-[#FFE033]' : isViewed && hasPrize,
                                'xborder-white ': isViewed,
                            },
                        )}
                        onClick={() => hasPrize && isViewed && handleArtworkTap(model.artworkId)}
                        data-before-content={paddedArtworkIndex}
                    >
                        <div
                            className={clsx('absolute  w-full h-full aspect-square overflow-hidden rounded-full', {
                                'opacity-100': isViewed,
                                ' bg-black': !isViewed,
                            })}
                        >
                            {!isViewed && <div className="absolute bg-black w-full h-full opacity-70"></div>}
                            <img src={model.image} alt="image of artwork" className="w-full h-full aspect-square" />
                        </div>
                        {!isBonus && !isViewed && <img src={QuestionMark} className="absolute w-full h-full p-3 xs:p-5 sm:p-7 aspect-square" />}
                        {isBonus && <img src={Bonus} className="absolute w-full h-full p-3 aspect-square" />}
                        {hasPrize && isViewed && <img src={Star} className="absolute left-1/2 -translate-x-1/2 -top-4 aspect-square" />}
                    </div>
                );
            })}
        </div>
    );
}

type MapProps = {
    onMapVisible: () => void;
};
function Map({ onMapVisible }: MapProps) {
    return (
        <div className="bg-[url('/src/features/header/assets/map-sm.png')] w-full h-44 flex items-center justify-center bg-contain">
            <button
                className="w-56 h-14 font-regular rounded-full text-lg bg-cb-green-500 active:bg-white active:text-cb-blue-950"
                onClick={onMapVisible}
            >
                <span className="block pt-[2px]">View Locations</span>
            </button>
        </div>
    );
}

function Instructions() {
    return (
        <div className="flex flex-col gap-y-4 px-5 py-10">
            <h2 className="text-base font-bold">About</h2>
            <p className="text-sm text-cb-iron-300 leading-[18px] tracking-[-0.2px]">
                Bankstown Arts Centre is home to engaging contemporary arts. As a multi-art form organisation, we
                champion experimental art practices and diverse artistic expressions for social impact and creative
                excellence. <br />
                <br />
                Explore the heart of Bankstown with Ginger the cat. He navigates the culturally diverse streets of the
                CBD and uncovers the creative hubs, sights, tastes and sounds of a thriving precinct.
            </p>
            <h2 className="text-base font-bold">Instructions</h2>
            <p className="text-sm text-cb-iron-300 leading-[18px]">
                Start your journey at any one of the 8 locations.
                <br />
                <br />
                Navigate your way through Bankstown to discover all 8 Augmented Reality experiences.
                <br />
                <br />
                Scan the QR code at each location and point your device to an open space to activate the experience.
                <br />
                <br />
                Don’t forget to record and share your experience to your socials.
                <br />
                <br />
                <span className="font-extrabold text-white">Remember to #bankstownwander #bankstownartscentre </span>
            </p>
        </div>
    );
}
