import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import greenTickImg from './assets/green-tick.svg';

type CopyToClipboardTriggerProps = React.HTMLAttributes<HTMLButtonElement> & {
    text: string;
};

export const CopyToClipboardTrigger = ({ text, children = 'COPY LINK' }: CopyToClipboardTriggerProps) => {
    const [copyToClipboard, copyResult] = useCopyToClipboard();

    const handleClickCopy = () => {
        copyToClipboard(text);
    };

    return (
        <>
            <div className="relative ">
                {copyResult && (
                    <div className="absolute link !font-normal -bottom-6 left-0 w-full text-xs text-center flex justify-center gap-2">
                        <img src={greenTickImg} />
                        Copied to Clipboard!
                    </div>
                )}
                <button className="cursor-pointer rounded-button" style={{
                    justifyContent: 'center',
                    borderColor: 'white',
                    color: 'white',
                }} onClick={handleClickCopy}>
                    {children}
                    
                </button>
            </div>
        </>
    );
};
