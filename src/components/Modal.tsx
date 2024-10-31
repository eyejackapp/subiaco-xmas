import { ReactNode } from 'preact/compat';
import { clsx } from 'clsx';

type ModalProps = {
    maxWidth?: string;
    maxHeight?: string;
    className?: string;
    children: ReactNode;
};

export const Modal = ({ maxWidth = 'max-w-[370px]', maxHeight = 'max-h-[600px]', className, children }: ModalProps) => {
    return (
        <div
            className={clsx(
                'bg-cover z-50 overflow-hidden w-[90%] h-[90%] rounded-3xl',
                className,
                maxWidth,
                maxHeight,
            )}
            data-cmp="Modal"
        >
            {children}
        </div>
    );
};
