import { Slider, SliderController } from '../../components/Slider';
import { Slide } from '../../components/Slide';
import { Modal } from '../../components/Modal';
import { ModalOverlay } from '../../components/ModalOverlay';
import 'keen-slider/keen-slider.min.css';
import OnboardingBg from './assets/bg.jpg';
import OnboardingBg2 from './assets/bg-2.png';
import ScanImg from './assets/scan.svg';
import TrackImg from './assets/track.svg';
import { SliderControlButton } from '../../components/SliderControlButton';
import Lockup from '../../components/Lockup';
import LockupSm from './assets/logo-2.png';

type OnboardingModalsProps = {
    onClose: () => void;
};

export const OnboardingModals = ({ onClose }: OnboardingModalsProps) => {
    const sliderController: SliderController = {
        post: () => {},
    };
    return (
        <ModalOverlay>
            <Modal
                maxWidth="max-w-[390px]"
                maxHeight="max-h-[600px]"
                className="bg-gray-900 bg-cover text-white centered w-[92%] "
            >
                <Slider controller={sliderController}>
                    <Slide className="flex flex-col h-full justify-between">
                        <img src={OnboardingBg} className="absolute inset-0 -z-10 w-full h-full" />
                        <div className="flex flex-col items-center justify-center ">
                            <img src={LockupSm} className="max-w-[66px] w-full pb-6 pt-1" />
                            <Lockup className="max-w-[260px]" />
                        </div>
                        {/* <div className="self-end"> */}
                        <p className="xs:text-[24px] text-lg xs:leading-8 leading-7 font-bold text-center flex-grow flex  items-center py-2">
                            Explore the streets of Bankstown and unlock Augmented Reality stories placed around iconic
                            landmarks and locations.
                        </p>
                        {/* </div> */}
                        <SliderControlButton sliderController={sliderController} message="next" text="Next" />
                    </Slide>
                    <Slide className="flex flex-col h-full justify-between bg-cb-river-blue-950">
                        <img src={OnboardingBg2} className="absolute inset-0 -z-10 w-full h-full" />
                        <div className="pt-8 flex flex-col flex-grow pb-8">
                            <img className="max-w-[86px] w-full" src={ScanImg} />
                            <h2 className="xs:text-[24px] text-xl font-bold flex-grow max-h-[105px] leading-[23.5px] flex items-center">Scan to unlock</h2>
                            <p className="xs:text-base text-sm leading-[125%] ">
                                Scan the QR codes to unlock each of the 8 unique stories located around iconic sites in
                                the Bankstown district.
                                <br />
                                <br />
                                Simply point your camera at the QR code and follow the instructions to place and
                                activate each story.
                            </p>
                        </div>
                        <SliderControlButton sliderController={sliderController} message="next" text="Next" />
                    </Slide>
                    <Slide className="flex flex-col h-full justify-between bg-cb-river-blue-950">
                        <img src={OnboardingBg2} className="absolute inset-0 -z-10 w-full h-full" />

                        <div className="pt-8 flex flex-col flex-grow pb-8 ">
                            <img className="max-w-[86px] w-full" src={TrackImg} />
                            <h2 className="xs:text-[24px] text-xl font-bold leading-[23.5px] flex-grow max-h-[105px] flex items-center">Track your progress</h2>
                            <p className="xs:text-base text-sm leading-[125%]">
                                You can check your progress on how many you have unlocked anytime by tapping on the
                                progress bar to open it.
                                <br />
                                <br />
                                Here you can tap on artworks you have not found to receive and clue on their location as
                                well as a map to help guide your way.
                            </p>
                        </div>
                        <SliderControlButton
                            sliderController={sliderController}
                            message="undefined"
                            text="Got it!"
                            onClick={onClose}
                        />
                    </Slide>
                </Slider>
            </Modal>
        </ModalOverlay>
    );
};
