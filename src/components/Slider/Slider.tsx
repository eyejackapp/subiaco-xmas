import { useKeenSlider } from 'keen-slider/react';
import { useState } from 'preact/hooks';
import 'keen-slider/keen-slider.min.css';
import { ReactNode } from 'preact/compat';

type SliderProps = {
    children: ReactNode;
    controller: SliderController;
};

export type SliderController = {
    post: (message: string) => void;
};

export const Slider = ({ controller, children }: SliderProps) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
        initial: 0,
        slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel);
        },
        created() {
            setLoaded(true);
        },
    });

    const post = (message: string) => {
        switch (message) {
            case 'next':
                instanceRef.current?.moveToIdx(currentSlide + 1);
                break;
            case 'reset':
                instanceRef.current?.moveToIdx(0);
                break;
        }
    };

    controller.post = post;

    return (
        <div ref={sliderRef} className="keen-slider w-full h-full">
            {children}

            {loaded && instanceRef.current && instanceRef.current.slides.length > 1 && (
                <div className="dots flex pt-3 justify-center absolute bottom-10 left-1/2 -translate-x-1/2">
                    {[...Array(instanceRef.current.track.details.slides.length).keys()].map((idx) => {
                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    instanceRef.current?.moveToIdx(idx);
                                }}
                                className={
                                    'dot pointer-events-auto border-none w-2 h-2 rounded-full mx-1 p-1 pointer focus:outline-none ' +
                                    (currentSlide == idx ? 'bg-cb-green-500' : 'bg-[rgba(255,255,255,0.2)]')
                                }
                            ></button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
