import { useErrorBoundary } from "preact/hooks";

type ErrorBoundaryProps = {
    error: Error;
}
export const ErrorPage = ({error}: ErrorBoundaryProps) => {
    const [resetError] = useErrorBoundary();

    const handleErrorReset = () => {
        resetError();
        window.location.reload();
    };
    return (
        <div className="absolute inset-0 z-[1000] bg-splash bg-cover bg-center h-full w-full bg-[#27204C] flex items-center justify-between flex-col p-8">
            <div className="w-full h-full  flex flex-col justify-end items-center gap-12">
                <h1 className="text-3xl text-center">Oops, something went wrong!</h1>
                <p className="text-lg text-center">Reason: {error.message}</p>
            </div>
            <div className="w-full h-full flex flex-col justify-center items-center gap-12">
                <button className="refraction-button pointer-events-auto" onClick={resetError}>
                    <a href="https://forms.gle/Qhr1NxWTa6tA3MQE9" target="_blank" rel="noreferrer">
                        Report Bug
                    </a>
                </button>
                <button
                    className="text-lg underline underline-offset-4 pointer-events-auto"
                    onClick={handleErrorReset}
                >
                    Go Back
                </button>
            </div>
        </div>
    )
}