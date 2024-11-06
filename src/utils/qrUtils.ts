export const QR_CODE_LOOKUP = {
    '1': 'xmas-tree',
    '2': 'artwork-2',
    '3': 'artwork-3',
    '4': 'artwork-4',
    '5': 'artwork-5',
    '6': 'artwork-6',
    '7': 'artwork-7',
    '8': 'artwork-8',
} as const;

const validCodes = Object.keys(QR_CODE_LOOKUP);
const validCodeRegex = new RegExp(`\\b(${validCodes.join('|')})\\b`);

/**
 * Validates the given code and returns the corresponding artwork ID if valid.
 * @param artworkNumber The artwork number from the QR code.
 * @returns The artwork ID if valid, or undefined if invalid.
 */
export function getArtworkIdFromCode(artworkNumber: string): string | undefined {
    if (!validCodeRegex.test(artworkNumber)) return undefined;
    return QR_CODE_LOOKUP[artworkNumber as keyof typeof QR_CODE_LOOKUP];
}
