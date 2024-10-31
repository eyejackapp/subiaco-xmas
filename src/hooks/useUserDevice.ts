import { useEffect, useState } from 'react';

export type TDevice = 'iOS' | 'Mac OS' | 'Windows' | 'Android' | 'Linux';

const useUserDevice = () => {
    const [device, setDevice] = useState<TDevice>();

    useEffect(() => {
        const { userAgent } = navigator;

        const platform = window.navigator.platform;
        const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
            windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
            iosPlatforms = ['iPhone', 'iPad', 'iPod'];

        if (macosPlatforms.indexOf(platform) !== -1) {
            //ipad pro get reported as MacIntel
            if (platform === 'MacIntel' && navigator.maxTouchPoints && navigator.maxTouchPoints > 2) setDevice('iOS');
            else setDevice('Mac OS');
        } else if (iosPlatforms.indexOf(platform) !== -1) {
            setDevice('iOS');
        } else if (windowsPlatforms.indexOf(platform) !== -1) {
            setDevice('Windows');
        } else if (/Android/.test(userAgent)) {
            setDevice('Android');
        } else if (!device && /Linux/.test(platform)) {
            setDevice('Linux');
        }
    }, []);

    return {
        device,
        isMobile: device === 'iOS' || device === 'Android',
    };
};

export default useUserDevice;
