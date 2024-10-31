import { KeepScale } from 'react-zoom-pan-pinch';

type PinMarkerProps = {
    position: {
        x: number;
        y: number;
    };
    imageUrl: string;
    scale: number;
};
export const PinMarker = ({ position, imageUrl, scale }: PinMarkerProps) => {
    return (
        <div
            style={{ left: `${String(position.x)}px`, top: `${String(position.y)}px`, transform: `scale(${scale})` }}
            className="absolute origin-bottom top-0 left-0 w-[50px] h-[50px] z-[10] aspect-square rounded-full after:content-[''] after:absolute after:-z-[10] after:top-full after:left-1/2 after:-translate-x-1/2 after:-translate-y-[9px] after:border-[20px] after:border-solid after:border-[#11D398_transparent_transparent_transparent]"
        >
            <div className="absolute z-1 w-full scale-[1.05] h-full aspect-square rounded-full bg-white"></div>{' '}
            <div className="relative z-[10] w-full h-full aspect-square overflow-hidden rounded-full">
                <img src={imageUrl} />
            </div>
        </div>
    );
};
