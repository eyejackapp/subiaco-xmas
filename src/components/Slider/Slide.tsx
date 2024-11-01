import { ReactNode } from 'preact/compat';
import { clsx } from 'clsx';

type SlideProps = {
    className?: string;
    children: ReactNode;
};

export const Slide = ({ className, children }: SlideProps) => {
    return <div className={clsx('keen-slider__slide w-full h-full px-[30px] py-10 pb-20', className)}>{children}</div>;
};
