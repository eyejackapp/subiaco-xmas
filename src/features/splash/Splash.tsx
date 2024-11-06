import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'preact/hooks';
import useUserDevice from '../../hooks/useUserDevice';
import { Logo8thWall } from './Logo8thWall';
import { Spinner } from '../../components/Spinner';
import { QrCodeGenerator } from '../../components/QrCodeGenerator';
import { CopyToClipboardTrigger } from '../../components/Generics/CopyToClipboardTrigger';
import { useTimeout } from '../../hooks/useTimeout';

type SplashProps = {
    onPermissionsGranted: () => void;
}

export function Splash({ onPermissionsGranted }: SplashProps) {
    const [pageType, setPageType] = useState<'loading' | 'default'>('loading');
    const [uiType, setUiType] = useState<'loading' | 'default'>('default');
    const { device } = useUserDevice();

    const [permissionDenied, setPermissionDenied] = useState<'camera-denied' | 'motion-denied' | undefined>(undefined);

    const requestCamera = () => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
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
        setPageType('default');
    }, 2000);


    const deviceType = useMemo(() => {
        if (device === undefined) {
            return 'loading';
        } else if (device === 'iOS' || device === 'Android' || device === 'AppClip') {
            return 'mobile';
        } else return 'desktop';
    }, [device]);

    return (
        <div
            className={clsx(
                'bg-cover bg-center h-full w-full text-white pointer-events-auto items-center xpx-5 py-12 flex flex-col',
            )}
        >
            <div className={clsx("flex-grow justify-center px-4 flex flex-col gap-6 text-center", {
                "basis-1/3": deviceType === 'desktop',
                "basis-2/3": deviceType === 'mobile'
            })}>
                <p>Subiaco</p>
                <h2 className="text-4xl font-bold">Subiaco Xmas</h2>
            </div>
            {deviceType === 'desktop' && (
                <DesktopSplash />
            )}

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
                                <div className="animate-fade-in xpb-5 flex justify-center items-center flex-col"><Spinner size="lg" /></div>

                                <div className="absolute bottom-0 pb-4">
                                    <Logo8thWall />
                                </div>
                            </>
                        )}
                        {pageType === 'default' && (
                            <>
                                <div
                                    className={clsx(
                                        'flex flex-col items-center flex-grow basis-1/2 px-5 pb-14 animate-fade-in justify-end',
                                    )}
                                >
                                    {uiType === 'default' && (
                                        <>
                                            <h2 className="text-lg md:text-xl items-end text-center animate-fade-in font-inter pb-12 px-5 leading-[115%]">
                                                Access to your camera, microphone,
                                                <br /> motion & orientation is required
                                            </h2>
                                            <div className="">
                                                <button onClick={requestMotion}>LAUNCH</button>
                                            </div>
                                        </>
                                    )}

                                </div>
                                {uiType === 'loading' && (
                                    <div className="animate-fade-in xpb-5 flex justify-center items-center flex-col"><Spinner size="lg" /><p className="pt-8 font-inter">Loading assets...</p></div>
                                )}
                            </>
                        )}

                    </>
            )}
            <div>

            </div>
        </div>
    );
}

function DesktopSplash() {
    // const url = useEJXLaunchUrl();
    const url = window.location.href
    return (
        <div className="flex flex-col gap-8 h-full w-full items-center">
            <div className="w-fit flex flex-col 3xl:gap-14 md:gap-10 gap-8 items-center justify-center">
                <QrCodeGenerator
                    value={url}
                    fgColor="#000000"
                    size={250}
                />
                <h2 className="text-white text-center md:text-[22px] text-xl font-helvetica-light md:leading-[26px] leading-[22px] tracking-[-0.41px]">
                    Scan the QR code to launch the<br />
                    Twinkling Treasure Hunt AR experience
                </h2>
                <CopyToClipboardTrigger text={url}>
                    <div className="border-2 min-w-[250px] border-white border-opacity-30 py-3 px-4 max-w-xs flex gap-x-2 relative cursor-pointer hover:opacity-50 hover:border-opacity-50">
                        <span className="link flex-grow text-center text-helvetica-heavy max-w-[310px] whitespace-nowrap overflow-hidden text-ellipsis w-full">
                            COPY LINK
                        </span>
                    </div>
                </CopyToClipboardTrigger>
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
