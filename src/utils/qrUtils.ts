export const QR_CODE_LOOKUP = {
    '1': 'present-storm',
    '2': 'santa-sleigh',
    '3': 'snow-globe',
    '4': 'santa-selfie',
    '5': 'xmas-tree',
    '6': 'toy-parade',
    '7': 'orbs',
    '8': 'bonus-snowman',
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
