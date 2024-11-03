import { useState, useCallback, useRef } from 'preact/hooks';
import { useEventListener } from './useEventListener';
import { getArtworkIdFromCode } from '../utils/qrUtils';
import { QRProcessEvents } from '../renderer/8thwall/qr-process-pipeline-module';

function useUrlHash() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1));
  const previousHashRef = useRef(hash);

  const handleHashChange = useCallback(() => {
    setHash(window.location.hash.slice(1));
  }, []);

  const updateHash = useCallback((newHash: string) => {
    if (newHash !== hash) {
      setHash(newHash);
      window.location.hash = newHash;
    }
  }, [hash]);

  const handleQRFound = useCallback((model: QRProcessEvents['qr-scan-result']) => {
    if (model.status === 'found') {
      const hash = new URL(model.data).hash.slice(1);
      const artworkId = getArtworkIdFromCode(hash);
      if (artworkId && artworkId !== previousHashRef.current) {
        console.log('UPDATE hash', artworkId, hash);
        updateHash(hash);
        previousHashRef.current = artworkId;
      }
    }
  }, [updateHash]);

  useEventListener('hashchange', handleHashChange);

  return { hash, updateHash, handleQRFound };
}

export default useUrlHash;
