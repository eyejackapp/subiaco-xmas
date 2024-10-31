import { ArtworkModel } from '../../renderer/artworks';
import clsx from 'clsx';

type ArtworkPopupProps = {
    currentArtworkModel: ArtworkModel;
    isPopupOpen: boolean;
    onToggleArtworkPopup: (e: Event) => void;
};
export function ArtworkPopup({ currentArtworkModel, isPopupOpen, onToggleArtworkPopup }: ArtworkPopupProps) {
    // const formattedLink = useMemo(() => {
    //     return currentArtworkModel.link.includes('www')
    //         ? currentArtworkModel.link.replace(/^https:\/\/www\./, '')
    //         : currentArtworkModel.link.replace(/^https:\/\//, '');
    // }, [currentArtworkModel]);

    return (
        <div className="bg-cb-dark-purple-950 pointer-events-auto flex flex-col" onClick={onToggleArtworkPopup}>
            <div className="flex items-center">
                <img
                    className={clsx(' w-20 h-20 transition-all duration-500 ', {
                        '-translate-x-20 ': isPopupOpen,
                        ' translate-x-0': !isPopupOpen,
                    })}
                    src={currentArtworkModel.image}
                    alt="artwork image"
                />
                <div
                    className={clsx('p-5 w-full transition-all duration-500', {
                        '-translate-x-20': isPopupOpen,
                        'translate-x-0': !isPopupOpen,
                    })}
                >
                    <h2 className="text-lg font-bold">{currentArtworkModel.name}</h2>
                    {/* <p className="text-base font-light tracking-[0.5px]">
                        {currentArtworkModel!.artist}
                    </p> */}
                </div>
                <button className="" onClick={onToggleArtworkPopup}>
                    {isPopupOpen ? (
                        <svg
                            className="absolute right-5 top-12 z-10"
                            width="14"
                            height="15"
                            viewBox="0 0 14 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M1 1.5L13 13.5" stroke="white" strokeWidth="2" />
                            <path d="M13 1.5L0.999999 13.5" stroke="white" strokeWidth="2" />
                        </svg>
                    ) : (
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            className="absolute right-5 bottom-5 z-10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M13 13L1 12.9999M13 13L13 7L13 1M13 13L2 2"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </button>
            </div>

            <div
                className={clsx('bg-cb-dark-purple-950 w-full transition-all overflow-hidden !duration-500 relative ', {
                    'h-0 ': !isPopupOpen,
                    'h-[calc(100dvh-192px)] overflow-scroll': isPopupOpen,
                })}
            >
                <img className="px-5 w-full" src={currentArtworkModel.artistImage} alt="artwork image" />
                <p
                    className="py-7 px-5 w-full text-sm font-light text-cb-iron-300 leading-[16px]"
                    dangerouslySetInnerHTML={{ __html: currentArtworkModel!.info }}
                ></p>
                <span className="block pb-5"></span>
            </div>
        </div>
    );
}
