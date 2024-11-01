export const QR_CODE_LOOKUP = {
    '9734': 'artwork-1',
    '6495': 'artwork-2',
    '8719': 'artwork-3',
    '4842': 'artwork-4',
    '1425': 'artwork-5',
    '3274': 'artwork-6',
    '9806': 'artwork-7',
    '7730': 'artwork-8',
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
