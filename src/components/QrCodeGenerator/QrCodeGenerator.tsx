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
        <div className="p-5 bg-white rounded-md xflex-shrink border ">
            <QRCode
                value={value}
                fgColor={fgColor}
                // size={Math.max(dimensions.width / 8, size)}
                size={size}
            />
        </div>
    );
};
