import { Ref, useLayoutEffect, useRef } from 'preact/hooks';

export default function useFadeOut(ref: Ref<HTMLElement>, fadeTime: number, visible: boolean | undefined) {
    const timerId = useRef<ReturnType<typeof setTimeout>>();

    useLayoutEffect(() => {
        clearTimeout(timerId.current);

        if (ref && ref.current) {
            ref.current.style.opacity = visible ? '1' : '0';
            ref.current.style.transition = `opacity ${fadeTime}ms ease-in-out`;
            if (visible) {
                ref.current.style.display = 'block';
            } else {
                timerId.current = setTimeout(() => {
                    if (ref.current) ref.current.style.display = 'none';
                }, fadeTime);
            }
        }
    }, [ref, visible, fadeTime]);
}
