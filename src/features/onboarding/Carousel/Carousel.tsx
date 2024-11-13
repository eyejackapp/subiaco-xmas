import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import { DotButton, useDotButton } from './CarouselDotButton';
import useEmblaCarousel from 'embla-carousel-react';
import clsx from 'clsx';
import { FunctionalComponent, ComponentChild } from 'preact';

type PropType = {
  slides?: number[];
  options?: EmblaOptionsType;
  children: ComponentChild[];
  carouselRef: any;
  emblaApi: EmblaCarouselType | undefined;
};

export const Carousel: FunctionalComponent<PropType> = (props) => {
  const { children, options } = props;

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(props.emblaApi);
  
  return (
    <section className="embla max-w-[48rem] h-full relative">
      {/* Carousel content with overlayed dots */}
      <div
        className={clsx('embla__viewport overflow-hidden w-full h-full')}
        ref={props.carouselRef}
      >
        <div className="embla__container h-full flex touch-pan-y touch-pinch-zoom ml-[calc(var(--slide-spacing)*-1)]">
          {children.map((child, index) => (
            <div
              key={index}
              className="embla__slide flex-[0_0_100%] min-w-0 pl-[var(--slide-spacing)]"
            >
              {child}
              
            </div>
          ))}
        </div>
      </div>


      {/* Dots overlayed on top of the carousel content */}
      {children.length > 1 && (
        <div className="embla__controls absolute bottom-4 w-full flex justify-center gap-5">
          <div className="embla__dots flex gap-2">
            {scrollSnaps.map((_, index) => (
              <DotButton
                key={index}
                onClick={() => onDotButtonClick(index)}
                className={
                  'embla__dot appearance-none bg-transparent cursor-pointer border-0 w-5 h-5 flex items-center justify-center after:w-3 after:h-3 after:rounded-full after:content-[""]' +
                  (index === selectedIndex
                    ? ' embla__dot--selected after:bg-[white] after:bg-opacity-100'
                    : ' after:bg-[white] after:bg-opacity-20')
                }
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
