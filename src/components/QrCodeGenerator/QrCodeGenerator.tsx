import useWindowDimensions from '../../hooks/useWindowDimensions';
import QRCode from 'react-qr-code';

type QRCodeProps = {
    size: number;
    style?: string;
    value: string;
    fgColor: string;
    viewBox?: string;
};
export const QrCodeGenerator = ({
    value,
    fgColor = '#030712',
    size,
}: QRCodeProps) => {
    const dimensions = useWindowDimensions();
    return (
        <div className="p-[10px] bg-white xrounded-md flex-shrink border border-black">
            <QRCode
                value={value}
                fgColor={fgColor}
                size={Math.max(dimensions.width / 8, size)}
            />
        </div>
    );
};
