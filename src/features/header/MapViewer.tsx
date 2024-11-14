import { PinMarker } from '../../components/PinMarker';
import Map from './assets/map.webp';
import PresentStorm from '../../assets/artworks/present-storm.png';
import SantaSleigh from '../../assets/artworks/santa-sleigh.png';
import SnowGlobe from '../../assets/artworks/snow-globe.png';
import SantaSelfie from '../../assets/artworks/santa-selfie.png';
import XmasTree from '../../assets/artworks/xmas-tree.png';
import ToyParade from '../../assets/artworks/toy-parade.png';
import Orbs from '../../assets/artworks/orbs.png';
import SnowMan from '../../assets/artworks/snow-man.png';
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
            <PinMarker position={{ x: 810, y: 1889 }} imageUrl={PresentStorm} scale={scale} />
            <PinMarker position={{ x: 1184, y: 1742 }} imageUrl={SantaSleigh} scale={scale} />
            <PinMarker position={{ x: 1395, y: 1772 }} imageUrl={SnowGlobe} scale={scale} /> 
            <PinMarker position={{ x: 1680, y: 1590 }} imageUrl={SantaSelfie} scale={scale} />
            <PinMarker position={{ x: 1946, y: 1340 }} imageUrl={XmasTree} scale={scale} />
            <PinMarker position={{ x: 1890, y: 1180 }} imageUrl={ToyParade} scale={scale} />
            <PinMarker position={{ x: 2050, y: 449 }} imageUrl={Orbs} scale={scale} />
            <PinMarker position={{ x: 1985, y: 623 }} imageUrl={SnowMan} scale={scale} /> 
        </>
    );
}
