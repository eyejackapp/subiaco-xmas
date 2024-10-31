import { useEffect } from 'preact/hooks';

const useOnScreenKeyboardScrollFix = (condition = true) => {
    useEffect(() => {
        if (!condition) return;
        const handleScroll = () => {
            window.scrollTo({
                top: 0,
            });
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [condition]);
};

export default useOnScreenKeyboardScrollFix;
