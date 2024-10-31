import clsx from 'clsx';
import { ARTWORK_ARRAY, ArtworkId, ArtworkModel } from '../../renderer/artworks';
import QuestionMark from './assets/question.svg';
import NotificationBar from '../notification-bar';
import { FAQs } from './FAQs';

export type HeaderBodyProps = {
    className?: string;
    viewedArtworks: ArtworkId[];
    currentArtwork: ArtworkId | undefined;
    onArtworkTapped: (model: ArtworkModel, artworkId: ArtworkId) => void;
    tappedArtwork: ArtworkModel | undefined;
    onClearViewedArtworks: () => void;
    onMapVisible: () => void;
    showArtworkClue: boolean;
    onClearCurrentArtwork: () => void;
    onToggleHeader: () => void;
    onShowInfoModal: (type: 'terms' | 'privacy') => void;
};

export function HeaderBody({
    viewedArtworks,
    currentArtwork,
    onArtworkTapped,
    tappedArtwork,
    onClearViewedArtworks,
    onMapVisible,
    showArtworkClue,
    onToggleHeader,
    onShowInfoModal,
}: HeaderBodyProps) {
    return (
        <div className="w-full bg-cb-dark-purple-950 relative">
            {showArtworkClue && tappedArtwork && (
                <NotificationBar
                    className={
                        'relative w-full top-0 animate-slide-down-fade z-10 bg-cb-dark-purple-950 border-b-[0.5px] border-b-cb-iron-300 border-opacity-50'
                    }
                >
                    <p className="py-4 px-5 font-light text-sm animate-fade-in">
                        <span className="font-bold">Clue {tappedArtwork.index + 1}: </span>
                        {tappedArtwork.clue}
                    </p>
                </NotificationBar>
            )}
            <ArtworkList
                viewedArtworks={viewedArtworks}
                currentArtwork={currentArtwork}
                onArtworkTapped={onArtworkTapped}
            />
            <span className="block bg-[#424242] h-[1px] w-full"></span>
            <Map onMapVisible={onMapVisible} />
            <span className="block bg-[#424242] h-[1px] w-full"></span>
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

type ArtworkListProps = {
    viewedArtworks: ArtworkId[];
    currentArtwork: ArtworkId | undefined;
    onArtworkTapped: (model: ArtworkModel, artworkId: ArtworkId) => void;
};
function ArtworkList({ viewedArtworks, currentArtwork, onArtworkTapped }: ArtworkListProps) {
    return (
        <div className="artwork-bg flex sm:gap-9 gap-7 sm:p-8 p-5 flex-wrap">
            {ARTWORK_ARRAY.map((model, index) => {
                const isViewed = viewedArtworks.includes(model.artworkId);
                const isCurrent = currentArtwork === model.artworkId;
                const paddedArtworkIndex = String(index + 1).padStart(2, '0');
                return (
                    <div
                        key={model.artworkId}
                        className={clsx(
                            `basis-[27%] h-full aspect-square border-2 rounded-full relative text-[10px] font-bold text-oslo-gray-400 before:content-[attr(data-before-content)] before:absolute before:-top-[2px] before:-left-[2px] before:font-number-sans active:border-2 active:border-1 active:border-cb-blue-950`,
                            {
                                // 'border-2': !isCurrent,
                                // 'border-3': isCurrent,
                                'border-cb-border-800 flex justify-center items-center': !isViewed,
                                'border-white ': isViewed,
                            },
                        )}
                        onClick={() => onArtworkTapped(model, model.artworkId)}
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
                        {!isViewed && <img src={QuestionMark} className="absolute w-full h-full p-7 aspect-square" />}
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
