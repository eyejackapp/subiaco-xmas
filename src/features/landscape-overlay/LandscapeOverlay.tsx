import clsx from 'clsx';
import LandscapeIcon from './assets/landscape-icon.svg';
type LandscapeOverlayProps = {
    className?: string;
};
export function LandscapeOverlay(props: LandscapeOverlayProps) {
    return (
        <div
            className={clsx(
                'absolute z-[1001] inset-0 bg-[#F0493C] w-full h-full flex flex-col justify-center items-center',
                props.className,
            )}
        >
            <img src={LandscapeIcon} />
            <p className="text-xl font-light text-white">This experience is best viewed in portrait mode</p>
        </div>
    );
}
