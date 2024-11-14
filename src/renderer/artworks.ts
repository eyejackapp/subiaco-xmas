import PresentStorm from "../assets/artworks/present-storm.png";
import SantaSleigh from "../assets/artworks/santa-sleigh.png";
import SnowGlobe from "../assets/artworks/snow-globe.png";
import SantaSelfie from "../assets/artworks/santa-selfie.png";
import XmasTree from "../assets/artworks/xmas-tree.png";
import ToyParade from "../assets/artworks/toy-parade.png";
import Orbs from "../assets/artworks/orbs.png";
import SnowMan from "../assets/artworks/snow-man.png";

type ArtworkDefiniton = {
  /** Path to the artwork folder */
  name: string;
  artist: string;
  basePath: string;
  audioPath: string;
  clue: string;
  image: string;
  unlockedInfo?: string;
  unlockedLogo?: string;
  link: string;
  index: number;
};

export const ARTWORKS = {
  "xmas-tree": {
    name: "Xmas Tree",
    artist: "Artist 1",
    basePath: "/content/Xmas_Tree.glb",
    audioPath: "/content/audio/Xmas_Tree.mp3",
    clue: "Home of the arts in Bankstown.",
    image: PresentStorm,
    unlockedInfo: "Spoil yourself or your loved ones with 15% off at Spoilt at Subi! To claim, head in store and show this offer when you make a purchase. Excludes Merry People products. Offer valid until 24 December 2024. Visit them at 20 Subiaco Square Rd, Subiaco.",
    unlockedLogo: "Spoil yourself or your loved ones with 15% off at Spoilt at Subi! To claim, head in store and show this offer when you make a purchase. Excludes Merry People products. Offer valid until 24 December 2024. Visit them at 20 Subiaco Square Rd, Subiaco.",
    link: "https://twitter.com/",
    index: 0,
  },
  "toy-parade": {
    name: "Toy Parade",
    artist: "Artist 2",
    basePath: "/content/Toy_Parade.glb",
    audioPath: "/content/audio/Toy_Parade.mp3",
    clue: "Sandwiched between the carpark and the street of shops.",
    image: SantaSleigh,
    link: "https://twitter.com/",
    index: 1,
  },
  "snow-globe": {
    name: "Snow Globe",
    artist: "Artist 3",
    basePath: "/content/Snow_Globe.glb",
    audioPath: "/content/audio/Snow_Globe.mp3",
    clue: "Right next to a divine dessert cafe.",
    image: SnowGlobe,
    link: "https://twitter.com/",
    index: 2,
  },
  "santa-sleigh": {
    name: "Santa Sleigh",
    artist: "Artist 4",
    basePath: "/content/Santa_Sleigh.glb",
    audioPath: "/content/audio/Santa_Sleigh.mp3",
    clue: "A stretch connecting two parts of Bankstown CVD.",
    image: SantaSelfie,
    link: "https://twitter.com/",
    index: 3,
  },
  "santa-selfie": {
    name: "Santa Selfie",
    artist: "Artist 5",
    basePath: "/content/Santa_Selfie.glb",
    audioPath: "/content/audio/Santa_Selfie.mp3",
    clue: "A wooden platform on the green.",
    image: XmasTree,
    unlockedInfo: "You've won a FREE rocky road bonbon from Nosh Gourmet Gifts! To claim, simply head in store, present this offer and give them a follow on socials. Visit them at shop 4/97 Rokeby Road, Subiaco.",
    link: "https://twitter.com/",
    index: 4,
  },
  "present-storm": {
    name: "Present Storm",
    artist: "Artist 6",
    basePath: "/content/Present_Storm.glb",
    audioPath: "/content/audio/Present_Storm.mp3",
    clue: "Circles of seats and bubble tea galore.",
    image: ToyParade,
    link: "https://twitter.com/",
    index: 5,
  },
  "snow-man": {
    name: "Snow Man",
    artist: "Artist 7",
    basePath: "/content/Snow_Man.glb",
    audioPath: "/content/audio/Snow_Man.mp3",
    clue: "Lush greenery in the city next to cultural venues.",
    image: Orbs,
    link: "https://twitter.com/",
    index: 6,
  },
  "bonus-orbs": {
    name: "Utopia",
    artist: "Artist 8",
    basePath: "/content/Orbs.glb",
    audioPath: "/content/audio/Orbs.mp3",
    clue: "A new world at the forecourt.",
    image: SnowMan,
    unlockedInfo: "You’ve won a special offer from Excelsior Deli!<br/><br/>Receive a FREE hot drink of any size when you spend $29 or more in one transaction. Offer excludes specialty coffees or drinks.To claim, simply head in store and present this offer. Find them at 140 Onslow Road, Shenton Park.",
    link: "https://twitter.com/",
    index: 7,
  },
} satisfies Record<string, ArtworkDefiniton>;

// -1 because of bonus artwork
export const ARTWORKS_LENGTH = Object.keys(ARTWORKS).length - 1;

export const ARTWORK_ARRAY = Object.entries(ARTWORKS).map(
  ([artworkId, definiton]) => ({
    artworkId: artworkId as ArtworkId,
    ...definiton,
  })
);

/**
 * Infered type of a valid artwork
 * Union type of key of ARTWORKS
 */
export type ArtworkId = keyof typeof ARTWORKS;
export type ArtworkModel = (typeof ARTWORKS)[ArtworkId];
