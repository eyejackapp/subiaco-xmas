import clsx from 'clsx';
import { useMemo, useState } from 'preact/hooks';
import useUserDevice from '../../hooks/useUserDevice';
import { Logo8thWall } from './Logo8thWall';
import { Spinner } from '../../components/Spinner';
import { QrCodeGenerator } from '../../components/QrCodeGenerator';
import { useTimeout } from '../../hooks/useTimeout';
import './splash.css';
import SeeSubiaco from './assets/see-subiaco.svg';
import MainLogo from './assets/main-logo.svg';
import MaskedTreeMobile from './assets/masked-tree-mobile.png';
import TreeDesktop from './assets/tree-desktop-stars.png';
import Snowflake from './assets/snowflake.svg';
import { CopyToClipboardTrigger } from './CopyToClipboardTrigger';
import ClipboardImg from '../../assets/clipboard.svg';
import useUnlockAudio from '@/hooks/useUnlockAudio';
import { ModalOverlay } from '@/components/Modal/ModalOverlay';

type SplashProps = {
    onPermissionsGranted: () => void;
}

export function Splash({ onPermissionsGranted }: SplashProps) {
    const [pageType, setPageType] = useState<'loading' | 'begin' | 'default'>('loading');
    const [uiType, setUiType] = useState<'loading' | 'default'>('default');
    const [showModalOverlay, setShowModalOverlay] = useState(false);
    const { device } = useUserDevice();
    useUnlockAudio("ejx-audio");

    const [permissionDenied, setPermissionDenied] = useState<'camera-denied' | 'motion-denied' | undefined>(undefined);

    const handleBegin = () => {
        setUiType('default');
        setPageType('default');
    }

    const requestCamera = () => {
        setShowModalOverlay(false);
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then(() => {
                onPermissionsGranted();
                setUiType('loading');
            })
            .catch((err) => {
                setPermissionDenied('camera-denied');
                console.log('Error: camera rejected.' + err);
            });
    };

    const requestMotion = () => {
        setShowModalOverlay(true);
        if (
            typeof DeviceMotionEvent !== 'undefined' &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            typeof (DeviceMotionEvent as any).requestPermission === 'function'
        ) {
            // motion avaiable
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (DeviceMotionEvent as any)
                .requestPermission()
                .then((response: string) => {
                    if (response === 'granted') {
                        requestCamera();
                    } else {
                        console.log(response);
                        setPermissionDenied('motion-denied');
                    }
                })
                .catch((err: Error) => {
                    setPermissionDenied('motion-denied');
                    console.log('Error: motion rejected.' + err);
                });
        } else {
            requestCamera();
        }
    };

    useTimeout(() => {
        setPageType('begin');
    }, 2000);


    const deviceType = useMemo(() => {
        if (device === undefined) {
            return 'loading';
        }
        else if (device === 'iOS' || device === 'Android' || device === 'AppClip') {
            return 'mobile';
        } else return 'desktop';
        return 'mobile';
    }, [device]);

    return (
        <div
            id="splash-bg"
            className={clsx(
                'bg-cover bg-center h-full w-full text-white relative xpointer-events-none overflow-hidden items-center xpx-5 flex flex-col',
            )}
        >
            {deviceType === 'loading' || deviceType === 'mobile' && (
                <>
                    <div id="masked-tree-mobile" className="pointer-events-none overflow-hidden" style={{
                        backgroundImage: `url(${MaskedTreeMobile})`,
                        bottom: pageType === 'loading' ? 'calc(30% - 1px)' : 'calc(35% - 1px)',
                        height: pageType === 'loading' ? '70%' : '100%',
                        width: pageType === 'loading' ? '100%' : '100%',
                        transform: pageType === 'loading' ? 'scale(1)' : 'scaleX(1.05)',
                        backgroundSize: pageType === 'loading' ? 'calc(100% + 5px) 100%' : 'calc(130% + 5px) 100%',
                        backgroundPosition: pageType === 'loading' ? 'center' : 'center',
                    }} />
                    <div id="bottom-tree" style={{
                        top: pageType === 'loading' ? '70%' : '50%',
                        height: pageType === 'loading' ? '30%' : '50%',
                    }}></div>
                    <div className="flex flex-col gap-4 items-center">
                        <div id="splash-top-half" style={{
                            height: pageType === 'loading' ? '50vh' : '45vh',

                        }}>
                            <img id="see-subiaco-logo" src={SeeSubiaco} />
                            <div id="main-logo" style={{
                                // backgroundImage: `url(${MainLogo})`,
                            }}>
                                <img className="" src={MainLogo} />
                                <img class="snowflake" src={Snowflake} style={{
                                    position: 'absolute',
                                    top: '-50px',
                                    right: '70px',
                                    width: '60px',
                                    height: '60px',
                                    opacity: pageType === 'loading' ? 1 : 0
                                }} />
                                <img class="snowflake" src={Snowflake} style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '26px',
                                    width: '30px',
                                    height: '30px',
                                    opacity: pageType === 'loading' ? 1 : 0
                                }} />
                                <img class="snowflake" src={Snowflake} style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    left: '-20px',
                                    width: '40px',
                                    height: '40px',
                                    opacity: pageType === 'loading' ? 1 : 0
                                }} />
                            </div>
                        </div>

                        <div id="splash-bottom-half" style={{
                            height: pageType === 'loading' ? '40vh' : '45vh',
                        }}>
                            {deviceType === 'loading' && (
                                <div className="flex flex-col justify-center items-center px-10 pb-10 basis-1/2 h-full">
                                    <Spinner size="lg" />
                                </div>
                            )}
                            {deviceType === 'mobile' && (
                                permissionDenied ? <PermissionsDeniedScreen permissionDenied={permissionDenied} /> :
                                    <>

                                        {pageType === 'loading' && (
                                            <>
                                                <p class="p-main text-2xl leading-[25px]">Discover the magic of <br></br>
                                                    Christmas in Subiaco</p>
                                                <div className="animate-fade-in" id="spinner" style={{
                                                    marginBottom: 15
                                                }}>
                                                    <Spinner size="lg" />
                                                </div>

                                                <div className="absolute bottom-0 pb-4">
                                                    <Logo8thWall />
                                                </div>
                                            </>
                                        )}

                                        {pageType === 'begin' && (

                                            <>
                                                <div
                                                    className={'animate-fade-in'}
                                                    style={{
                                                        // paddingBottom: '30px'
                                                    }}>
                                                    <p class="p-main text-2xl leading-[21px]" style={{
                                                        fontSize: '20px',
                                                    }}>To learn more about<br />Christmas in Subiaco visit</p>
                                                    <a href="https://seesubiaco.com.au/christmas" target="_blank" className="pointer-events-auto"><button class="p-main text-2xl link" style={{
                                                        marginTop: '10px',
                                                        fontSize: '20px',
                                                    }}>SeeSubiaco.com.au/Christmas</button></a>
                                                </div>
                                                <p class="p-main text-2xl animate-fade-in leading-[29px]">Begin the Twinkling<br />Treasure Hunt</p>
                                                <button class="rounded-button animate-fade-in" onClick={handleBegin} style={{
                                                    // marginBottom: '10px'
                                                }} >Begin</button>

                                            </>

                                        )}

                                        {pageType === 'default' && (
                                            <>
                                                <div
                                                    className={clsx(
                                                        'flex flex-col items-center flex-grow basis-1/2 px-5 animate-fade-in justify-end',
                                                    )}
                                                >
                                                    {/* {uiType === 'default' || uiType === 'loading' && ( */}
                                                        <>
                                                            <h2 className="text-lg md:text-xl items-end text-center animate-fade-in font-inter pb-12 px-5 leading-[24px]">
                                                                Access to your camera, microphone,
                                                                <br /> motion & orientation is required.
                                                                <br /><br />
                                                                Ensure volume is turned up for<br />the best experience.</h2>
                                                            <div className="">
                                                                <button class="rounded-button" onClick={requestMotion} style={{
                                                                    // marginBottom: '10px'
                                                                }} >
                                                                    {/* Allow

                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="12" viewBox="0 0 24 12" fill="none">
                                                                        <path d="M17 1L22 6L17 11" stroke="#FAEFD5" stroke-width="2" />
                                                                        <path d="M22 6H0" stroke="#FAEFD5" stroke-width="2" />
                                                                    </svg> */}

                                                                    {uiType === 'loading' ? (
                                                                        <span className="animate-fade-in pointer-events-none">
                                                                            <Spinner
                                                                                size="md"
                                                                            />
                                                                        </span>
                                                                    ) : (
                                                                        <>
                                                                            Allow

                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="12" viewBox="0 0 24 12" fill="none">
                                                                                <path d="M17 1L22 6L17 11" stroke="#FAEFD5" stroke-width="2" />
                                                                                <path d="M22 6H0" stroke="#FAEFD5" stroke-width="2" />
                                                                            </svg>
                                                                            </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </>
                                                    {/* )} */}

                                                </div>
                                                {showModalOverlay && (
                                                    <ModalOverlay>''</ModalOverlay>
                                                    // <div className="animate-fade-in xpb-5 flex justify-center items-center flex-col"><Spinner size="lg" /><p className="pt-8 font-inter">Loading assets...</p></div>
                                                )}
                                            </>
                                        )}

                                    </>
                            )}
                        </div>
                    </div>
                </>
            )}

            {deviceType === 'desktop' && (

                <>
                    <div id="tree-desktop" style={{
                        backgroundImage: `url(${TreeDesktop})`,
                    }} />

                    <div className="gap-4 w-full overflow-scroll " style={{
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        // justifyContent: 'space-between',
                        height: '100vh',
                    }}>
                        <div>
                            <div id="main-logo" style={{
                                backgroundImage: `url(${MainLogo})`,
                                marginTop: '60px'
                            }} />
                            <p class="p-main 3xl:text-2xl text-xl" style={{
                                marginTop: '25px'
                            }}>21 November - 31 December</p>
                        </div>

                        <DesktopSplash />
                    </div>
                </>

            )}



        </div>
    );
}

function DesktopSplash() {
    // const url = useEJXLaunchUrl();
    const url = window.location.href
    return (
        <div className="flex-grow flex flex-col justify-center items-center gap-8">
            <QrCodeGenerator
                value={url}
                fgColor="#971741"
                size={200}
            />
            <div className="flex flex-col 3xl:gap-8 gap-6 w-full items-center">
                <div className="w-fit flex flex-col 3xl:gap-10 md:gap-6 gap-6 items-center justify-center">

                    <div className="gap-6" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        // justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '80px',
                    }} >
                        <h2 className="font-secondary-sans text-[#FAEFD5] text-center p-main 3xl:text-2xl text-xl">
                            Join the Twinkling Treasure Hunt
                        </h2>
                        <h2 className="text-white text-center md:text-[20px] text-xl font-helvetica-light md:leading-[22px] leading-[22px] tracking-[-0.41px]">
                            Scan the QR code to launch the<br />
                            Twinkling Treasure Hunt AR experience
                        </h2>
                        {/* <button className="rounded-button">COPY LINK</button> */}
                        <CopyToClipboardTrigger text={url}>
                            <p className="font-sans" style={{
                                paddingTop: '0px'
                            }}>COPY LINK</p>
                            <img src={ClipboardImg} />
                        </CopyToClipboardTrigger>

                    </div>
                </div>

            </div>
        </div>
    );
}


type PermissionsDeniedScreenProps = {
    permissionDenied: 'camera-denied' | 'motion-denied' | undefined;
};
function PermissionsDeniedScreen({ permissionDenied }: PermissionsDeniedScreenProps) {
    return (
        <div className="flex flex-col flex-grow justify-start gap-y-20 items-center px-10 mb-12 basis-1/2">
            {permissionDenied === 'camera-denied' && (
                <>
                    <h2 className="text-2xl font-light text-center">Camera access is required.</h2>
                    <h2 className="text-2xl font-light text-center">Quit and open the browser again.</h2>
                </>
            )}
            {permissionDenied === 'motion-denied' && (
                <>
                    <h2 className="text-2xl font-light text-center ">Motion and orientation access is required.</h2>
                    <h2 className="text-2xl font-light text-center ">Quit and open the browser again.</h2>
                </>
            )}
        </div>
    );
}
