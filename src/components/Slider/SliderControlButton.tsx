import { clsx } from 'clsx';
import { SliderController } from './ui/Slider/Slider';

type SliderControlButtonProps = {
    sliderController: SliderController;
    message: string;
    className?: string;
    text?: string;
    onClick?: () => void;
};

export const SliderControlButton = ({
    sliderController,
    message,
    className,
    text,
    onClick,
}: SliderControlButtonProps) => {
    return (
        <button
            className={clsx('refraction-button mx-auto', className)}
            onClick={() => {
                sliderController.post(message);
                if (onClick) onClick();
            }}
        >
            {text}
        </button>
    );
};
