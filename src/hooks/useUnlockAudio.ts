import { useCallback } from "preact/hooks";
import { useEventListener } from "./useEventListener";

const useAutoUnlockAudio = (audioId: string) => {
    const unlockAudio = useCallback(() => {
        const audio = document.getElementById(audioId) as HTMLAudioElement;

        if (audio) {
            try {
                audio.pause();
                audio.muted = false;
                document.removeEventListener("pointerdown", unlockAudio);
            } catch (error) {
                console.error("Failed to unlock audio. Retrying on next interaction...", error);
            }
        }
    }, [audioId]);

    useEventListener("pointerdown", unlockAudio, document);
};

export default useAutoUnlockAudio;
