import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { memo } from 'preact/compat';
import { ARTWORKS_LENGTH } from '../../renderer/artworks';
import clsx from 'clsx';
import { HeaderBody } from './HeaderBody';
import { useArtwork } from '@/hooks/useArtwork';
import UserForm from '@/components/UserForm';
import { useAppState } from '@/hooks/useAppState';
import { useRenderer } from '@/context/RendererContext';
import { Modal } from '@/components/Modal/Modal';


export const Header = () => {
    const [isHeaderOpen, setIsHeaderOpen] = useState(false);
    const [infoModalType, setInfoModalType] = useState<'terms' | 'privacy' | undefined>(undefined);
    const onShowInfoModal = (type: 'terms' | 'privacy') => {
        setInfoModalType(type);
    };

    const { isSurveyOpen } = useAppState();
    const { regularArtworks } = useArtwork();
    const { renderer } = useRenderer();

    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const onToggleHeader = useCallback(() => {
        setIsHeaderOpen((isOpen) => !isOpen);
    }, []);

    useMemo(() => {
        return isHeaderOpen ? renderer?.pauseTracking() : renderer?.resumeTracking();
    }, [isHeaderOpen, renderer]);


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

    return (
        <div
            className={clsx('header-child relative top-0 w-full z-10 bg-gray-100 Header pointer-events-auto', {
                // 'animate-slide-down': recordingState.state === 'none',
                // 'animate-slide-up': recordingState.state !== 'none',
            })}
        >
            <div
                className="px-5 py-5 w-full bg-[#C4A056] bg-[length:100%_160%] bg-center flex justify-between items-end cursor-pointer"
                onClick={onToggleHeader}
            >
                <h2 className="-mb-[6px] text-[18px] font-bold tracking-[1px] leading-none">
                    <span className="pr-1 text-[34px] font-extrabold leading-none">{regularArtworks?.length ?? 0}</span> OF{' '}
                    <span className="px-1 text-[34px] font-extrabold leading-none">{ARTWORKS_LENGTH}</span> FOUND
                </h2>
                <p className="flex items-center -mb-2 font-base tracking-[1px] font-bold">
                    TAP TO {isHeaderOpen ? 'CLOSE' : 'OPEN'}
                    <span className="px-[3px]"></span>
                    <span className={clsx('transition-transform duration-500 mb-[3px]', { 'rotate-180': isHeaderOpen })}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M13 13L1 12.9999M13 13L13 7L13 1M13 13L2 2"
                                stroke="#ffffff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                </p>
            </div>

            {isSurveyOpen && <div className="fixed top-0 w-full h-full z-[100] bg-[#EA81A4] flex items-center justify-center"><UserForm /></div>}
            {infoModalType !== undefined && (
                <InfoModal type={infoModalType} onClose={() => setInfoModalType(undefined)} />
            )}
            <div
                ref={scrollElement}
                className={clsx('header-bar w-full transition-[max-height] duration-500 ', {
                    'max-h-0 overflow-hidden': !isHeaderOpen,
                    'max-h-[calc(100dvh)] overflow-scroll': isHeaderOpen,
                })}
            >
                <HeaderBody
                    onToggleHeader={onToggleHeader}
                    onShowInfoModal={onShowInfoModal}
                />
            </div>
        </div>
    );
}

type InfoModalProps = {
    type: 'terms' | 'privacy';
    onClose: () => void;
};
function InfoModal({ type, onClose }: InfoModalProps) {
    return (
        <div className="fixed top-0 w-full h-full z-[100] animate-fade-in">
            <Modal
                className="overflow-scroll py-10 px-5 rounded-none bg-cb-blue-950 w-full h-full"
                maxWidth="max-w-full"
                maxHeight="max-h-full"
            >
                {type === 'terms' && (
                    <>
                        <div className="flex justify-between items-center pb-8">
                            <h2 className="text-xl text-white">Terms and Conditions</h2>
                            <button className="" onClick={onClose}>
                                <svg
                                    width="14"
                                    height="15"
                                    viewBox="0 0 14 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M1 1.5L13 13.5" stroke="white" strokeWidth="2" />
                                    <path d="M13 1.5L0.999999 13.5" stroke="white" strokeWidth="2" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-sm font-light text-cb-iron-300">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sed ultricies ipsum, at
                            sodales urna. Ut sagittis arcu non consectetur condimentum. Sed tincidunt ante eu nisi
                            varius, placerat posuere ante dictum. Aenean id est vel justo faucibus ullamcorper id eget
                            dolor. Vivamus ut justo orci. Duis venenatis nisl quis consectetur laoreet. Fusce nec nunc
                            nunc. Donec vehicula, nunc sed facilisis hendrerit, urna massa ornare dolor, eu pellentesque
                            lacus metus at elit. Quisque convallis maximus odio, ac tempor enim sodales in.
                            <br />
                            <br />
                            Nam scelerisque tellus a arcu ullamcorper eleifend. Donec tincidunt augue vitae ultricies
                            lobortis. Aenean vel laoreet ipsum, sit amet mollis est. Donec eget magna et arcu commodo
                            suscipit. Fusce tristique lectus vel leo sodales, sed posuere justo luctus. Fusce quis diam
                            vel turpis posuere bibendum. Aliquam ac leo in urna vulputate euismod.
                            <br />
                            <br />
                            Duis mollis nisl vitae nisi consectetur congue. Phasellus a pellentesque arcu. Donec finibus
                            et diam eget sollicitudin. Etiam vel nisi in leo lobortis varius dictum at ligula. Etiam a
                            quam at libero posuere ultrices. Praesent accumsan vestibulum pulvinar. Mauris blandit, nisi
                            eget mattis tincidunt, ex libero auctor ante, nec convallis tellus magna id augue. Sed ac
                            lobortis dolor. Aenean eros nibh, sollicitudin et urna quis, rutrum mattis massa. Maecenas
                            gravida, ante nec luctus suscipit, arcu nisi pretium mauris, et porta magna nisi sit amet
                            ligula. Proin pellentesque lacus nisi, sed laoreet velit laoreet ac.
                            <br />
                            <br />
                            <br />
                        </p>
                    </>
                )}
                {type === 'privacy' && (
                    <>
                        <div className="flex justify-between items-center pb-8">
                            <h2 className="text-xl text-white">Privacy Policy</h2>
                            <button className="" onClick={onClose}>
                                <svg
                                    width="14"
                                    height="15"
                                    viewBox="0 0 14 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M1 1.5L13 13.5" stroke="white" strokeWidth="2" />
                                    <path d="M13 1.5L0.999999 13.5" stroke="white" strokeWidth="2" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-sm font-light text-cb-iron-300">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sed ultricies ipsum, at
                            sodales urna. Ut sagittis arcu non consectetur condimentum. Sed tincidunt ante eu nisi
                            varius, placerat posuere ante dictum. Aenean id est vel justo faucibus ullamcorper id eget
                            dolor. Vivamus ut justo orci. Duis venenatis nisl quis consectetur laoreet. Fusce nec nunc
                            nunc. Donec vehicula, nunc sed facilisis hendrerit, urna massa ornare dolor, eu pellentesque
                            lacus metus at elit. Quisque convallis maximus odio, ac tempor enim sodales in.
                            <br />
                            <br />
                            Nam scelerisque tellus a arcu ullamcorper eleifend. Donec tincidunt augue vitae ultricies
                            lobortis. Aenean vel laoreet ipsum, sit amet mollis est. Donec eget magna et arcu commodo
                            suscipit. Fusce tristique lectus vel leo sodales, sed posuere justo luctus. Fusce quis diam
                            vel turpis posuere bibendum. Aliquam ac leo in urna vulputate euismod.
                            <br />
                            <br />
                            Duis mollis nisl vitae nisi consectetur congue. Phasellus a pellentesque arcu. Donec finibus
                            et diam eget sollicitudin. Etiam vel nisi in leo lobortis varius dictum at ligula. Etiam a
                            quam at libero posuere ultrices. Praesent accumsan vestibulum pulvinar. Mauris blandit, nisi
                            eget mattis tincidunt, ex libero auctor ante, nec convallis tellus magna id augue. Sed ac
                            lobortis dolor. Aenean eros nibh, sollicitudin et urna quis, rutrum mattis massa. Maecenas
                            gravida, ante nec luctus suscipit, arcu nisi pretium mauris, et porta magna nisi sit amet
                            ligula. Proin pellentesque lacus nisi, sed laoreet velit laoreet ac.
                            <br />
                            <br />
                            <br />
                        </p>
                    </>
                )}
            </Modal>
        </div>
    );
}
