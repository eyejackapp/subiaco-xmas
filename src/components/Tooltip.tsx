import clsx from 'clsx';
import { ReactNode } from 'preact/compat';
type TooltipProps = {
    children: ReactNode;
    visible?: boolean;
    className?: string;
};
export const Tooltip = ({ children, visible = true, className }: TooltipProps) => {
    return (
        <div
            className={clsx(
                'z-[2] font-light text-xs text-center after:content-[""] after:absolute after:top-1/2 after:left-full after:-translate-y-1/2 after:border-[12px] after:border-solid after:border-[transparent_transparent_transparent_#0f61ff]',
                className,
                { 'opacity-0': !visible, 'opacity-1': visible },
            )}
        >
            {children}
        </div>
    );
};
