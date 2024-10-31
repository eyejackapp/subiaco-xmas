import clsx from 'clsx';
import { useRef, useState } from 'preact/hooks';

type Faq = {
    question: string;
    answer: string;
};
const faqs: Faq[] = [
    {
        question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sed ultricies ipsum, at sodales urna. Ut sagittis arcu non consectetur condimentum.',
    },
    {
        question: 'Lorem ipsum dolor sit amet?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sed ultricies ipsum, at sodales urna. Ut sagittis arcu non consectetur condimentum.',
    },
    {
        question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sed ultricies ipsum, at sodales urna. Ut sagittis arcu non consectetur condimentum.',
    },
];

export function FAQs() {
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
    return (
        <div className="px-5 pb-10">
            <h2 className="text-base pb-4">FAQs</h2>
            <div className="border-b border-cb-iron-300 border-opacity-20">
                {faqs.map((faq: Faq, index) => {
                    return (
                        <FAQ
                            data={faq}
                            key={index}
                            isActive={activeIndex === index}
                            onShow={() => {
                                activeIndex === index ? setActiveIndex(undefined) : setActiveIndex(index);
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

type FAQProps = {
    data: Faq;
    isActive: boolean;
    onShow: () => void;
};
function FAQ({ data, isActive, onShow }: FAQProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const handleShow = () => {
        onShow();
    };
    return (
        <>
            <div
                className="flex justify-between items-center py-[14px] border-cb-iron-300 border-opacity-20 border-t "
                onTouchStart={handleShow}
            >
                <p className="text-sm font-normal">{data.question}</p>
                <div className={clsx('transition-all duration-500', { 'rotate-180': isActive })}>
                    <svg width="11" height="7" viewBox="0 0 11 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.5 1.00049L5.49998 6.00049L10.5 1.00052" stroke="white" />
                    </svg>
                </div>
            </div>
            <div
                ref={contentRef}
                className={clsx('overflow-hidden text-sm font-light leading-4 text-cb-iron-300', {
                    'max-h-0': !isActive,
                    'max-h-full pb-[14px]': isActive,
                })}
            >
                {data.answer}
            </div>
        </>
    );
}
