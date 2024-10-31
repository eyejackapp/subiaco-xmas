import useWindowDimensions from '../../hooks/useWindowDimenstions';
import QRCode from 'react-qr-code';

type QRCodeProps = {
    size?: number;
    style?: string;
    value: string;
    viewBox?: string;
};
export const QrCodeGenerator = ({ value }: QRCodeProps) => {
    const { height } = useWindowDimensions();
    return (
        <div className="p-6 mt-8 short:p-4 bg-white rounded-md w-fit">
            {/* @ts-expect-error: no types */}
            <QRCode value={value} fgColor={'#16205D'} size={height > 830 ? 256 : 180} />
        </div>
    );
};
