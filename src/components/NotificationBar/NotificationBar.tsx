import clsx from 'clsx';
import { ReactNode } from 'preact/compat';

type NotificationBarProps = {
    children: ReactNode;
    className?: string;
};
export function NotificationBar({ children, className }: NotificationBarProps) {
    return <div className={clsx('z-10', className)}>{children}</div>;
}
