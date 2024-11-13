import { Modal } from "../../components/Modal/Modal";
import { ModalOverlay } from "../../components/Modal/ModalOverlay";
import "keen-slider/keen-slider.min.css";
import OnboardingBg from "./assets/onboarding-tree-card.png";
import OnboardingBg2 from "./assets/onboarding-bg-2.png";
import { Carousel } from "./Carousel";
import "./onboarding.css";
import SeeSubiaco from "./assets/see-subiaco.svg";
import MainLogo from "./assets/main-logo.svg";
import Snowflake from "./assets/snowflake.svg";
import useEmblaCarousel from "embla-carousel-react";

type OnboardingModalsProps = {
  onClose: () => void;
};

export const OnboardingModals = ({ onClose }: OnboardingModalsProps) => {
  const slides = [
    <div className="slide bg-blue-500 text-white flex items-center justify-center h-full w-full">
      Slide 1
    </div>,
    <div className="slide bg-red-500 text-white flex items-center justify-center h-full w-full">
      Slide 2
    </div>,
    <div className="slide bg-green-500 text-white flex items-center justify-center h-full">
      Slide 3
    </div>,
  ];

  const carouselOptions = {
    loop: true,
    draggable: true,
  };

  const [carouselRef, emblaApi] = useEmblaCarousel(carouselOptions);

  const goToNextSlide = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  return (
    <ModalOverlay>
      <Modal
        maxWidth="max-w-[390px]"
        maxHeight="max-h-[600px]"
        className="bg-gray-900 bg-cover text-white centered w-[92%] "
      >
        <Carousel
          options={carouselOptions}
          carouselRef={carouselRef}
          emblaApi={emblaApi}
        >
          <div
            className={"onboarding-slide slide h-full w-full"}
            style={{
              position: "relative",
              backgroundImage: `url(${OnboardingBg})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div class="top-section-onboarding">
              <img id="see-subiaco-logo-onboarding" src={SeeSubiaco} />
              <div
                id="main-logo"
                style={{
                  backgroundImage: `url(${MainLogo})`,
                  marginTop: "100px",
                  width: "238px",
                  height: "137px",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <img
                  class="snowflake"
                  src={Snowflake}
                  style={{
                    position: "absolute",
                    top: "-80px",
                    left: "20px",
                    width: "60px",
                    height: "60px",
                    opacity: 1,
                  }}
                />
                <img
                  class="snowflake"
                  src={Snowflake}
                  style={{
                    position: "absolute",
                    top: "-50px",
                    right: "36px",
                    width: "30px",
                    height: "30px",
                    opacity: 1,
                  }}
                />
                <img
                  class="snowflake"
                  src={Snowflake}
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "-20px",
                    width: "40px",
                    height: "40px",
                    opacity: 1,
                  }}
                />
              </div>
              <p
                class="p-main"
                style={{
                  marginTop: "50px",
                }}
              >
                Welcome to the
                <br />
                Twinkling Treasure Hunt
              </p>
            </div>
            <button
              onClick={goToNextSlide}
              class="rounded-button"
              style={{
                marginBottom: 60,
              }}
            >
              Next
            </button>
          </div>

          <div
            className={" slide h-full w-full"}
            style={{
              backgroundImage: `url(${OnboardingBg2})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              position: "relative",
            }}
          >
            <img id="see-subiaco-logo-onboarding-2" src={SeeSubiaco} />
            <div class="middle-section">
              <div></div>
              <div
                style={{
                  marginTop: "60px",
                  marginLeft: "30px",
                  marginRight: "30px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  gap: "20px",
                }}
              >
                <p>
                  Step into the twilight and experience Subiaco as you've never
                  seen it before!
                </p>
                <p>
                  The Subiaco Twilight Trail invites you to wander through
                  glowing streets and enchanting spaces past 8 stunning
                  installations.{" "}
                </p>
                <p>
                  PLUS! Immerse yourself in the magic by activating the
                  Twinkling Treasure Hunt for some added surprises.
                </p>
              </div>

              <button
                onClick={goToNextSlide}
                class="rounded-button"
                style={{
                  marginBottom: 60,
                }}
              >
                Next
              </button>
            </div>
          </div>

          <div
            className={" slide h-full w-full"}
            style={{
              backgroundImage: `url(${OnboardingBg2})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              position: "relative",
            }}
          >
            <img id="see-subiaco-logo-onboarding-2" src={SeeSubiaco} />
            <div class="middle-section">
              <div></div>
              <div
                style={{
                  marginTop: "60px",
                  marginLeft: "30px",
                  marginRight: "30px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  gap: "20px",
                }}
              >
                <p>
                Start your journey at any of the 7 Subiaco locations or the bonus Shenton Park stop by viewing the map online or below. 
                </p>
                <p>
                Follow the map to discover each installation and scan the EyeJack QR code to watch them come to life. Collect special offers and gifts at select stops along the way.  
                </p>
                <p>
                Activate all 7 Subiaco installations to go in the draw to WIN a year's worth of FREE 
                ice-cream from Whisk Creamery! Plus the first 300 people to complete the trail will also win an instant prize!  
                </p>
              </div>

              <button
                onClick={onClose}
                class="rounded-button"
                style={{
                  marginBottom: 60,
                }}
              >
                Got it!
              </button>
            </div>
          </div>
        </Carousel>
      </Modal>
    </ModalOverlay>
  );
};
