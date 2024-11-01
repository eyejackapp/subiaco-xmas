import { useState, useCallback } from 'preact/hooks';
import { useEventListener } from './useEventListener';

function useUrlHash() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1));

  const handleHashChange = useCallback(() => {
    setHash(window.location.hash.slice(1));
  }, []);

  const updateHash = useCallback((newHash: string) => {
    if (newHash !== hash) {
      setHash(newHash);
      window.location.hash = newHash;
    }
  }, [hash]);

  useEventListener('hashchange', handleHashChange);

  return { hash, updateHash };
}

export default useUrlHash;
