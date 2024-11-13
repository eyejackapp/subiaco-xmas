import { FunctionalComponent } from 'preact';
import { ComponentChildren } from 'preact';

type PropType = {
  children: ComponentChildren;
};

export const Slide: FunctionalComponent<PropType> = (props) => {
  return (
    <div className="embla__slide flex-[0_0_var(--slide-size)] min-w-0 pl-[var(--slide-spacing)]">
      {props.children}
    </div>
  );
};
