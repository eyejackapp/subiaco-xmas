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
import { useMount } from '@/hooks/useMount';
export function MapViewer() {
    const [scale, setScale] = useState(1);
    useTransformEffect(({ state, instance }) => {
        setScale(1 / state.scale);
        return () => {
            // unmount
        };
    });
    useMount(() => {
        setScale(3)
    })
    return (
        <>
            <img style={{ maxWidth: 'none' }} className="touch-none pointer-events-none" src={Map} alt="map" />
            <PinMarker position={{ x: 2180, y: 249 }} imageUrl={PresentStorm} scale={scale} />
            <PinMarker position={{ x: 2185, y: 369 }} imageUrl={SantaSleigh} scale={scale} />
            <PinMarker position={{ x: 2245, y: 369 }} imageUrl={SnowGlobe} scale={scale} />
            <PinMarker position={{ x: 2185, y: 500 }} imageUrl={SantaSelfie} scale={scale} />
            <PinMarker position={{ x: 2145, y: 660 }} imageUrl={XmasTree} scale={scale} />
            <PinMarker position={{ x: 2170, y: 940 }} imageUrl={ToyParade} scale={scale} />
            <PinMarker position={{ x: 2135, y: 1090 }} imageUrl={Orbs} scale={scale} />
            <PinMarker position={{ x: 650, y: 2873 }} imageUrl={SnowMan} scale={scale} />
        </>
    );
}
