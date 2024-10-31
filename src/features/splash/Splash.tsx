import { useMemo, useState } from 'preact/hooks';
import { QrCodeGenerator } from './QrCodeGenerator';
import { CopyToClipboardTrigger } from './CopyToClipboardTrigger';
import clipboardImg from './assets/clipboard.svg';
import useImagePreloader from '../../hooks/useImagePreloader';
import { preloadSrcList } from '../../utils/preload-asset-list';

import clsx from 'clsx';
import Spinner from '../../components/Spinner';
import useTimeGuard from './useTimeGuard';
import { Logo8thWall } from './Logo8thWall';
import Lockup from '../../components/Lockup';
import { useTimeout } from 'ahooks';
import { TDevice } from '../../hooks/useUserDevice';
import LockupSm from './assets/logo-sm.png';
import Key from './assets/key-splash.webp';
import { FadeTransition } from '../../components/Transitions';

type SplashProps = {
    onPermissionsGranted: () => void;
    isLoadingExperience: boolean;
    device: TDevice;
};

// Currently set to 2023-12-6_18:00:00 (UTC) (Launch is 1pm EST, EST is (-5hr) therefore 6pm)
// Use https://www.epochconverter.com/ (make sure to use the millisecond version) to re-calculate.
const skipTimeguard = new URLSearchParams(location.search).has('skip_timeguard');
// const UTC_GO_LIVE_TIME = import.meta.env.VITE_SST_STAGE === 'prod' ? 1701885600000 : 1699293600000;
const UTC_GO_LIVE_TIME = 1699293600000;

export function Splash({ onPermissionsGranted, isLoadingExperience, device }: SplashProps) {
    useImagePreloader(preloadSrcList);

    const timeGuardState = useTimeGuard(UTC_GO_LIVE_TIME);

    const [permissionDenied, setPermissionDenied] = useState<'camera-denied' | 'motion-denied' | undefined>(undefined);

    const requestCamera = () => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then(() => {
                onPermissionsGranted();
            })
            .catch((err) => {
                setPermissionDenied('camera-denied');
                console.log('Error: camera rejected.' + err);
            });
    };

    const requestMotion = () => {
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

    const [pageType, setPageType] = useState<'loading' | 'default'>('loading');
    const uiType = useMemo(() => {
        // if (timeGuardState.state === 'loading' || pageType === 'loading') {
        if (pageType === 'loading') {
            return 'loading';
        } else if (timeGuardState.state === 'blocked' && !skipTimeguard) {
            return 'timeguard';
        } else return 'default';

        throw new Error('Unhandled splash state.');
    }, [timeGuardState.state, pageType]);

    useTimeout(() => {
        setPageType('default');
    }, 2000);

    const deviceType = useMemo(() => {
        if (device === undefined) {
            return 'loading';
        } else if (device === 'iOS' || device === 'Android') {
            return 'mobile';
        } else return 'desktop';
    }, [device]);

    return (
        <div
            className={clsx(
                'absolute touch-none inset-0 z-[1000] bg-cover bg-center h-full w-full flex text-white pointer-events-auto',
                {
                    'bg-splash-desktop py-20 gap-y-8 flex-col justify-center short-narrow-desktop:flex-row short-narrow-desktop:gap-x-8':
                        deviceType === 'desktop',
                    'bg-splash py-10 flex-col justify-between': deviceType !== 'desktop',
                },
            )}
        >
            <div
                className={clsx('w-full flex justify-center items-center z-10', {
                    'basis-1/3 flex-end': deviceType === 'desktop',
                    'basis-1/2 flex-grow ': deviceType !== 'desktop',
                })}
            >
                <div className="flex flex-col items-center justify-between h-full w-full">
                    {deviceType !== 'desktop' && <img src={LockupSm} className="max-w-[120px] w-full pt-4" />}
                    <Lockup
                        // size={deviceType === 'desktop' ? 'large' : 'default'}
                        size={'large'}
                        className={clsx('', {
                            'max-w-[650px] w-full max-h-full px-8 py-4': deviceType === 'desktop',
                            ' w-full px-8 py-4': deviceType !== 'desktop',
                            'flex-shrink -mb-20 ': pageType === 'loading' && deviceType === 'mobile',
                            'flex-grow animate-slide-up duration-1000':
                                pageType === 'default' && deviceType === 'mobile',
                        })}
                    />
                </div>
            </div>
            {deviceType === 'loading' && (
                <div className="flex flex-col justify-end items-center px-10 pb-10 basis-1/2">
                    <Spinner />
                </div>
            )}
            {deviceType === 'mobile' && (
                <>
                    {permissionDenied ? (
                        <PermissionsDeniedScreen permissionDenied={permissionDenied} />
                    ) : (
                        <>
                            <div className="flex flex-col justify-end items-center px-8 mb-12 basis-1/2">
                                {uiType === 'timeguard' && (
                                    <>
                                        <h2 className="font-light text-center text-[26px] animate-fade-in">
                                            Join us from Dec 6th at 1pm
                                        </h2>
                                        <div className="py-10"></div>

                                        <h2 className="pb-6 text-xl font-light"> Add to Calendar</h2>
                                        <div className="flex justify-evenly px-4 w-full text-base font-light underline underline-offset-[3px]">
                                            <a className="decoration-0" href="https://calndr.link/e/hZUDGcWw97?s=apple">
                                                iCal
                                            </a>
                                            <a
                                                className="decoration-0"
                                                href="https://calndr.link/e/hZUDGcWw97?s=google"
                                            >
                                                Google
                                            </a>
                                            <a
                                                className="decoration-0"
                                                href="https://calndr.link/e/hZUDGcWw97?s=outlook"
                                            >
                                                Outlook
                                            </a>
                                            <a
                                                className="decoration-0"
                                                href="https://calndr.link/e/hZUDGcWw97?s=office365"
                                            >
                                                Office365
                                            </a>
                                        </div>
                                        <div className="py-8"></div>
                                    </>
                                )}
                                {uiType === 'loading' && <Spinner />}

                                {uiType === 'default' && (
                                    <>
                                        <h2 className="text-xl font-light text-center animate-fade-in font-secondary-sans">
                                            Access to your camera, microphone,
                                            <br /> motion & orientation is required
                                        </h2>
                                        <div className="py-6"></div>
                                    </>
                                )}

                                {uiType !== 'loading' && (timeGuardState.state === 'ok' || skipTimeguard || true) && (
                                    <>
                                        <button
                                            className={clsx(
                                                'flex relative justify-center items-center font-button refraction-button',
                                                'animate-fade-in',
                                                'disabled:opacity-50',
                                            )}
                                            onClick={requestMotion}
                                            disabled={isLoadingExperience}
                                        >
                                            {isLoadingExperience ? (
                                                <span className="animate-fade-in">
                                                    <Spinner width={30} height={30} />
                                                </span>
                                            ) : (
                                                <span className="relative text-lg font-sans">
                                                    Allow
                                                    <span className="absolute -right-8 top-1/2 -translate-y-[60%]">
                                                        <svg
                                                            width="24"
                                                            height="12"
                                                            viewBox="0 0 24 12"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                className="stroke-current"
                                                                d="M17 1L22 6L17 11"
                                                                stroke="white"
                                                                strokeWidth="2"
                                                            />
                                                            <path
                                                                className="stroke-current"
                                                                d="M22 6H0"
                                                                stroke="white"
                                                                strokeWidth="2"
                                                            />
                                                        </svg>
                                                    </span>
                                                </span>
                                            )}
                                        </button>
                                    </>
                                )}

                                <FadeTransition show={pageType === 'loading'} duration={1000}>
                                    <img
                                        src={Key}
                                        className="max-w-[90%] w-full absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                    />
                                </FadeTransition>
                                {pageType === 'loading' && (
                                    <>
                                        <div className="absolute bottom-0 pb-4">
                                            <Logo8thWall />
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
            {deviceType === 'desktop' && <DesktopSplash />}
        </div>
    );
}

function DesktopSplash() {
    return (
        <div className="flex flex-col gap-8 justify-center items-center mt-8">
            <img className="absolute top-[3dvh] right-[3dvh] max-w-[15dvh] h-auto" src={LockupSm}></img>
            <QrCodeGenerator value={window.location.href} />
            <h2 className="text-lg font-light text-center sm:text-[22px]">
                Scan the QR code to launch the
                <br />
                AR art walk experience
            </h2>
            <CopyToClipboardTrigger text={window.location.href}>
                <div className="flex relative gap-x-2 py-3 px-4 max-w-xs border-2 border-white border-opacity-30 cursor-pointer hover:border-opacity-50 hover:opacity-50 min-w-[250px]">
                    <span className="overflow-hidden flex-grow w-full text-center whitespace-nowrap font-button link max-w-[310px] text-ellipsis">
                        COPY LINK
                    </span>
                    <img className="absolute right-3 cursor-pointer" src={clipboardImg} />
                </div>
            </CopyToClipboardTrigger>
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
