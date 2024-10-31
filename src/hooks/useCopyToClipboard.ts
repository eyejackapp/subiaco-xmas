// https://codefrontend.com/copy-to-clipboard-in-js/#google_vignette
import { useState } from 'preact/hooks';
export const useCopyToClipboard = () => {
    const [result, setResult] = useState<null | { state: 'success' } | { state: 'error'; message: string }>(null);

    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setResult({ state: 'success' });
        } catch (e: any) {
            setResult({ state: 'error', message: e.message });
            throw e;
        } finally {
            setTimeout(() => {
                setResult(null);
            }, 2000);
        }
    };

    return [copy, result] as const;
};
