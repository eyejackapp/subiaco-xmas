export const QR_CODE_LOOKUP = {
    '1': 'xmas-tree',
    '2': 'toy-parade',
    '3': 'snow-globe',
    '4': 'santa-sleigh',
    '5': 'santa-selfie',
    '6': 'present-storm',
    '7': 'snow-man',
    '8': 'orbs',
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
