import { useState, useCallback, useRef } from "preact/hooks";
import { useEventListener } from "./useEventListener";
import { getArtworkIdFromCode } from "../utils/qrUtils";
import { QRProcessEvents } from "../renderer/8thwall/qr-process-pipeline-module";

function useUrlHash(onHashChange?: () => void) {
  const [hash, setHash] = useState(() => window.location.hash.slice(1));
  const previousHashRef = useRef(hash);

  const updateHash = useCallback(
    (newHash: string, artworkId: string) => {
      if (newHash !== hash) {
        setHash(newHash);
        // window.location.hash = newHash;
        window.history.replaceState(null, '', `#${newHash}`);
        previousHashRef.current = artworkId;
        if (onHashChange) {
          onHashChange();
        }
      }
    },
    [hash, onHashChange]
  );

  const handleHashChange = useCallback(() => {
    const newHash = window.location.hash.slice(1);
    const artworkId = getArtworkIdFromCode(newHash);
    setHash(newHash);
    if (artworkId && artworkId !== previousHashRef.current) {
      updateHash(newHash, artworkId);
    }
  }, [updateHash]);

  const handleQRFound = useCallback(
    (model: QRProcessEvents["qr-scan-result"]) => {
      if (model.status === "found") {
        const hash = new URL(model.data).hash.slice(1);
        const artworkId = getArtworkIdFromCode(hash);
        if (artworkId && artworkId !== previousHashRef.current) {
          // console.log("UPDATE hash", artworkId);
          updateHash(hash, artworkId);
        }
      }
    },
    [updateHash]
  );

  useEventListener("hashchange", handleHashChange);

  return { hash, updateHash, handleQRFound };
}

export default useUrlHash;
