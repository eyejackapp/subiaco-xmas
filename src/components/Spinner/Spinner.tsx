import clsx from 'clsx';

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-16 w-16',
  xl: 'h-[52px] w-[52px]',
  '2xl': 'h-24 w-24',
};

const thicknesses = {
  default: '7.28571',
  thin: '5'
}

const variants = {
  light: 'text-white',
  primary: 'text-blue-600',
};

export type SpinnerProps = {
  size?: keyof typeof sizes;
  variant?: keyof typeof variants;
  thickness?: keyof typeof thicknesses;
  className?: string;
};

export const Spinner = ({ size = 'xl', variant = 'light', thickness = 'default', className = '' }: SpinnerProps) => {
  return (
    <>
      <svg className={clsx('animate-spin', variants[variant], sizes[size], className)} viewBox="0 0 59 59" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="loading" >
        <path d="M28.9796 55C15.1837 55 4 43.5833 4 29.5C4 15.4167 15.1837 4 28.9796 4" stroke="currentColor" strokeWidth={thicknesses[thickness]} strokeLinecap="round" />
        <path d="M30.0204 55C43.8163 55 55 43.5833 55 29.5C55 25.073 53.8949 20.9095 51.951 17.2812" stroke="url(#paint0_linear_123_3400)" strokeWidth={thicknesses[thickness]} strokeLinecap="round" />
        <defs>
          <linearGradient id="paint0_linear_123_3400" x1="30.0204" y1="55" x2="51.5043" y2="16.5921" gradientUnits="userSpaceOnUse">
            <stop stopColor="currentColor" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <span className="sr-only">Loading</span>
    </>
  );
};