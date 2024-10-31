import { PinMarker } from '../../components/PinMarker';
import Map from './assets/map-3.png';
import Artwork1 from '../../assets/artworks/artwork-1.webp';
import Artwork2 from '../../assets/artworks/artwork-2.webp';
import Artwork3 from '../../assets/artworks/artwork-3.webp';
import Artwork4 from '../../assets/artworks/artwork-4.webp';
import Artwork5 from '../../assets/artworks/artwork-5.webp';
import Artwork6 from '../../assets/artworks/artwork-6.webp';
import Artwork7 from '../../assets/artworks/artwork-7.webp';
import Artwork8 from '../../assets/artworks/artwork-8.webp';
import { useTransformEffect } from 'react-zoom-pan-pinch';
import { useState } from 'preact/hooks';
export function MapViewer() {
    const [scale, setScale] = useState(1);
    useTransformEffect(({ state, instance }) => {
        setScale(1 / state.scale);
        return () => {
            // unmount
        };
    });

    return (
        <>
            <img style={{ maxWidth: 'none' }} className="touch-none pointer-events-none" src={Map} alt="map" />
            <PinMarker position={{ x: 810, y: 1889 }} imageUrl={Artwork1} scale={scale} />
            <PinMarker position={{ x: 1184, y: 1742 }} imageUrl={Artwork2} scale={scale} />
            <PinMarker position={{ x: 1395, y: 1772 }} imageUrl={Artwork3} scale={scale} /> 
            <PinMarker position={{ x: 1680, y: 1590 }} imageUrl={Artwork4} scale={scale} />
            <PinMarker position={{ x: 1946, y: 1340 }} imageUrl={Artwork5} scale={scale} />
            <PinMarker position={{ x: 1890, y: 1180 }} imageUrl={Artwork6} scale={scale} />
            <PinMarker position={{ x: 2050, y: 449 }} imageUrl={Artwork7} scale={scale} />
            <PinMarker position={{ x: 1985, y: 623 }} imageUrl={Artwork8} scale={scale} /> 
        </>
    );
}
