import Artwork1 from '../assets/artworks/artwork-1.jpg';
import Artwork2 from '../assets/artworks/artwork-2.jpg';
import Artwork3 from '../assets/artworks/artwork-3.jpg';
import Artwork4 from '../assets/artworks/artwork-4.jpg';
import Artwork5 from '../assets/artworks/artwork-5.jpg';
import Artwork6 from '../assets/artworks/artwork-6.jpg';
import Artwork7 from '../assets/artworks/artwork-7.jpg';
import Artwork8 from '../assets/artworks/artwork-8.jpg';

import Artwork1Thumbnail from '../assets/artworks/artwork-1.webp';
import Artwork2Thumbnail from '../assets/artworks/artwork-2.webp';
import Artwork3Thumbnail from '../assets/artworks/artwork-3.webp';
import Artwork4Thumbnail from '../assets/artworks/artwork-4.webp';
import Artwork5Thumbnail from '../assets/artworks/artwork-5.webp';
import Artwork6Thumbnail from '../assets/artworks/artwork-6.webp';
import Artwork7Thumbnail from '../assets/artworks/artwork-7.webp';
import Artwork8Thumbnail from '../assets/artworks/artwork-8.webp';

type ArtworkDefiniton = {
    /** Path to the artwork folder */
    name: string;
    artist: string;
    basePath: string;
    clue: string;
    image: string;
    artistImage: string;
    info: string;
    link: string;
    index: number;
};

export const ARTWORKS = {
    'artwork-1': {
        name: 'Art Abound',
        artist: 'Artist 1',
        basePath: '/artworks/story-1/',
        clue: 'Home of the arts in Bankstown.',
        image: Artwork1Thumbnail,
        artistImage: Artwork1,
        info: 'Ginger lands in the heart of the arts, <br />Bankstown Arts Centre greets<br />With textures, shapes, sounds and colour off the charts.',
        link: 'https://twitter.com/',
        index: 0,
    },
    'artwork-2': {
        name: 'Marketplace',
        artist: 'Artist 2',
        basePath: '/artworks/story-2/',
        clue: 'Sandwiched between the carpark and the street of shops.',
        image: Artwork2Thumbnail,
        artistImage: Artwork2,
        info: 'Curiosity calls Ginger, the cacophony of noise<br />Picking up pace, he explores the street of stalls.',
        link: 'https://twitter.com/',
        index: 1,
    },
    'artwork-3': {
        name: 'Food Encounter',
        artist: 'Artist 3',
        basePath: '/artworks/story-3/',
        clue: 'Right next to a divine dessert cafe.',
        image: Artwork3Thumbnail,
        artistImage: Artwork3,
        info: 'Smells too rich to ignore, he inhales and leaps off he goes, which one first – meat or sweets?',
        link: 'https://twitter.com/',
        index: 2,
    },
    'artwork-4': {
        name: 'Crossing Cultures',
        artist: 'Artist 4',
        basePath: '/artworks/story-4/',
        clue: 'A stretch connecting two parts of Bankstown CVD.',
        image: Artwork4Thumbnail,
        artistImage: Artwork4,
        info: 'A hoo-man child. Who is he?<br />Sounds unfamiliar but feels so friendly.<br/>Meow on approach, bite free.',
        link: 'https://twitter.com/',
        index: 3,
    },
    'artwork-5': {
        name: 'A Place to Gather',
        artist: 'Artist 5',
        basePath: '/artworks/story-5/',
        clue: 'A wooden platform on the green.',
        image: Artwork5Thumbnail,
        artistImage: Artwork5,
        info: 'Musical Ginger on a bold adventure,<br/>Leaping next to the stage, he thinks,<br/>“I’d love me some boogie. Let’s party to the beat!”',
        link: 'https://twitter.com/',
        index: 4,
    },
    'artwork-6': {
        name: 'Fashion Parade',
        artist: 'Artist 6',
        basePath: '/artworks/story-6/',
        clue: 'Circles of seats and bubble tea galore.',
        image: Artwork6Thumbnail,
        artistImage: Artwork6,
        info: 'With newfound friends, Ginger struts his stuff<br/>Swapping clothes at dizzying speeds,<br/>All in the spirit of fashion fun.',
        link: 'https://twitter.com/',
        index: 5,
    },
    'artwork-7': {
        name: 'Urban Garden',
        artist: 'Artist 7',
        basePath: '/artworks/story-7/',
        clue: 'Lush greenery in the city next to cultural venues.',
        image: Artwork7Thumbnail,
        artistImage: Artwork7,
        info: 'Rest and recharge after the rush<br/>As he enters an urban oasis,<br/>A cocoon that envelops, Ginger finds Zen.',
        link: 'https://twitter.com/',
        index: 6,
    },
    'artwork-8': {
        name: 'Utopia',
        artist: 'Artist 8',
        basePath: '/artworks/story-8/',
        clue: 'A new world at the forecourt.',
        image: Artwork8Thumbnail,
        artistImage: Artwork8,
        info: 'He dreams of a future<br/>For this kaleidoscopic place Darani<br/>A wondrous high-tech eco city.',
        link: 'https://twitter.com/',
        index: 7,
    },
} satisfies Record<string, ArtworkDefiniton>;

export const ARTWORKS_LENGTH = Object.keys(ARTWORKS).length;

export const ARTWORK_ARRAY = Object.entries(ARTWORKS).map(([artworkId, definiton]) => ({
    artworkId: artworkId as ArtworkId,
    ...definiton,
}));

/**
 * Infered type of a valid artwork
 * Union type of key of ARTWORKS
 */
export type ArtworkId = keyof typeof ARTWORKS;
export type ArtworkModel = (typeof ARTWORKS)[ArtworkId];
