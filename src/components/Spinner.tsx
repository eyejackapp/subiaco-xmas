import clsx from 'clsx';

type SpinnerProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function Spinner({ className, width = 60, height = 59 }: SpinnerProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 60 59"
            className={clsx('animate-spin', className)}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M29.4796 55C15.6837 55 4.5 43.5833 4.5 29.5C4.5 15.4167 15.6837 4 29.4796 4"
                stroke="white"
                strokeWidth="7.28571"
                strokeLinecap="round"
            />
            <path
                d="M30.5202 55C44.316 55 55.4998 43.5833 55.4998 29.5C55.4998 25.073 54.3947 20.9095 52.4507 17.2812"
                stroke="url(#paint0_linear_1578_4187)"
                strokeWidth="7.28571"
                strokeLinecap="square"
            />
            <defs>
                <linearGradient
                    id="paint0_linear_1578_4187"
                    x1="30.5202"
                    y1="55"
                    x2="52.004"
                    y2="16.5921"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="white" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
}
