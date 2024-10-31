import { Transition } from '@headlessui/react';
import { ReactNode, useEffect, useState } from 'preact/compat';

type FadeTransitionProps<T> = {
    show: T;
    children: ReactNode | ((value: NonNullable<T>) => ReactNode);
    duration?: number;
};

export function FadeTransition<T>(props: FadeTransitionProps<T>) {
    const [lastDefined, setLastDefined] = useState(props.show);
    useEffect(() => {
        if (!!props.show) {
            setLastDefined(props.show);
        }
    }, [props.show]);

    const children =
        typeof props.children === 'function'
            ? lastDefined
                ? props.children(lastDefined as NonNullable<T>)
                : null
            : props.children;

    return (
        <Transition
            style={`transition-duration: ${props.duration}ms`}
            show={!!props.show}
            enter="transition-opacity"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            {children}
        </Transition>
    );
}
