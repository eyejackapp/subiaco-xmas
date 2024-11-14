import PresentStorm from "../assets/artworks/present-storm.png";
import SantaSleigh from "../assets/artworks/santa-sleigh.png";
import SnowGlobe from "../assets/artworks/snow-globe.png";
import SantaSelfie from "../assets/artworks/santa-selfie.png";
import XmasTree from "../assets/artworks/xmas-tree.png";
import ToyParade from "../assets/artworks/toy-parade.png";
import Orbs from "../assets/artworks/orbs.png";
import SnowMan from "../assets/artworks/snow-man.png";

import PresentStormUnlocked from "../assets/unlocked-modals/present-storm-unlocked.svg";
import XmasTreeUnlocked from "../assets/unlocked-modals/xmas-tree-unlocked.svg";
import SnowManUnlocked from "../assets/unlocked-modals/snow-man-unlocked.svg";

type ArtworkDefiniton = {
  name: string;
  artist: string;
  basePath: string;
  audioPath: string;
  image: string;
  unlockedInfo?: string;
  unlockedLogo?: string;
  index: number;
};

export const ARTWORKS = {
  "present-storm": {
    name: "Present Storm",
    artist: "Subi Starlit Tree",
    basePath: "/content/Present_Storm.glb",
    audioPath: "/content/audio/Present_Storm.mp3",
    image: PresentStorm,
    unlockedInfo: "Spoil yourself or your loved ones with 15% off at Spoilt at Subi! To claim, head in store and show this offer when you make a purchase. Excludes Merry People products. Offer valid until 24 December 2024. Visit them at 20 Subiaco Square Rd, Subiaco.",
    unlockedLogo: PresentStormUnlocked,
    index: 0,
  },
  "santa-sleigh": {
    name: "Santa Sleigh",
    artist: "Twinkle Twinkle",
    basePath: "/content/Santa_Sleigh.glb",
    audioPath: "/content/audio/Santa_Sleigh.mp3",
    image: SantaSleigh,
    index: 1,
  },
  "snow-globe": {
    name: "Snow Globe",
    artist: "Gingerbread Train",
    basePath: "/content/Snow_Globe.glb",
    audioPath: "/content/audio/Snow_Globe.mp3",
    image: SnowGlobe,
    index: 2,
  },
  "santa-selfie": {
    name: "Santa Selfie",
    artist: "Festive Voyage",
    basePath: "/content/Santa_Selfie.glb",
    audioPath: "/content/audio/Santa_Selfie.mp3",
    image: SantaSelfie,
    index: 3,
  },
  "xmas-tree": {
    name: "Xmas Tree",
    artist: "Golden Gateway",
    basePath: "/content/Xmas_Tree.glb",
    audioPath: "/content/audio/Xmas_Tree.mp3",
    image: XmasTree,
    unlockedInfo: "You've won a FREE rocky road bonbon from Nosh Gourmet Gifts! To claim, simply head in store, present this offer and give them a follow on socials. Visit them at shop 4/97 Rokeby Road, Subiaco.",
    unlockedLogo: XmasTreeUnlocked,
    index: 4,
  },
  "toy-parade": {
    name: "Toy Parade",
    artist: "Luminous Lizard",
    basePath: "/content/Toy_Parade.glb",
    audioPath: "/content/audio/Toy_Parade.mp3",
    image: ToyParade,
    index: 5,
  },
  "orbs": {
    name: "Orbs",
    artist: "Enchanted Wings",
    basePath: "/content/Orbs.glb",
    audioPath: "/content/audio/Orbs.mp3",
    image: Orbs,
    index: 6,
  },
  "bonus-snowman": {
    name: "Snow Man",
    artist: "Magical Owl",
    basePath: "/content/Snow_Man.glb",
    audioPath: "/content/audio/Snow_Man.mp3",
    image: SnowMan,
    unlockedInfo: "You’ve won a special offer from Excelsior Deli!<br/><br/>Receive a FREE hot drink of any size when you spend $29 or more in one transaction. Offer excludes specialty coffees or drinks.To claim, simply head in store and present this offer. Find them at 140 Onslow Road, Shenton Park.",
    unlockedLogo: SnowManUnlocked,
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
