import { ReactNode } from 'preact/compat';
import { clsx } from 'clsx';

type ModalOverlayProps = {
    color?: string;
    opacity?: string;
    children: ReactNode;
    className?: string;
};

export const ModalOverlay = ({
    color = 'bg-[#000000]',
    opacity = 'opacity-[0.5]',
    children,
    className,
}: ModalOverlayProps) => {
    return (
        <div className={clsx(className, 'pointer-events-auto')} data-cmp="ModalOverlay">
            <div
                className={clsx(
                    'w-full h-full absolute top-0 left-0 z-10 flex justify-center items-center',
                    color,
                    opacity,
                )}
            ></div>
            {children}
        </div>
    );
};
