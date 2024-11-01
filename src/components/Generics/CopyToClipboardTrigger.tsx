import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import ClipboardImg from '../../assets/clipboard.svg';
import clsx from "clsx";
import { HTMLAttributes } from "preact/compat";

type CopyToClipboardTriggerProps = HTMLAttributes<HTMLButtonElement> & {
  text: string;
};

export const CopyToClipboardTrigger = ({
  text,
  children = "COPY LINK",
}: CopyToClipboardTriggerProps) => {
  const [copyToClipboard, copyResult] = useCopyToClipboard();

  const handleClickCopy = () => {
    copyToClipboard(text);
  };

  return (
    <>
      <div className="relative z-10 cursor-pointer hover:bg-opacity-10 hover:bg-black" onClick={handleClickCopy}>
        <div className="">
            <svg className={clsx("absolute right-2 top-1/2 -translate-y-1/2 stroke-green-500 [stroke-dasharray:100] [stroke-dashoffset:100]", {
              ' animate-draw-svg': copyResult,
              'animate-reverse-draw-svg': !copyResult
            })} width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 6.4L4.63025 10L12.6975 1" stroke="#000000" strokeWidth="2" />
            </svg> 
             <img
              className={clsx("absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer", {
                'animate-reverse-draw-svg opacity-0': copyResult,
                'animate-draw-svg delay-500 opacity-1': !copyResult
              })}
              src={ClipboardImg}
            />
        </div>
        <button className="">{children}</button>
      </div>
    </>
  );
};
