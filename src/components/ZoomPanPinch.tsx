import { TransformWrapper, TransformComponent, KeepScale } from 'react-zoom-pan-pinch';
import { ReactNode } from 'preact/compat';

type ZoomPanPinchProps = {
    children: ReactNode;
};
export const ZoomPanPinch = ({ children }: ZoomPanPinchProps) => {
    return (
        // <TransformWrapper centerOnInit={true} minScale={1} maxScale={4} initialScale={1}>
        //     <TransformComponent wrapperClass="absolute z-50 h-full w-full block max-w-full">{children}
        <TransformWrapper centerOnInit={true} minScale={0.3} maxScale={1} initialScale={0.3} >
            <TransformComponent
                wrapperStyle={{
                    maxWidth: '100%',
                    maxHeight: 'calc(100vh - 100px)',
                }}
            >
                {children}
            </TransformComponent>
        </TransformWrapper>
    );
};
