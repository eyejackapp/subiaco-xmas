// ArtworkContext.js
import { useContext, useState, useMemo } from 'preact/hooks';
import { ARTWORKS, ArtworkId } from '../renderer/artworks';
import { useLocalStorageState } from 'ahooks';

const ArtworkContext = createContext();

export const useArtwork = () => {
  return useContext(ArtworkContext);
};

export const ArtworkProvider = ({ children }) => {
  const [currentArtwork, setCurrentArtwork] = useState(undefined);

  const currentArtworkModel = useMemo(() => {
    return currentArtwork ? ARTWORKS[currentArtwork] : undefined;
  }, [currentArtwork]);

  const [viewedArtworks, setViewedArtworks] = useLocalStorageState('viewedArtworks', {
    defaultValue: [],
  });

  const [tappedArtwork, setTappedArtwork] = useState(null);
  const [showArtworkClue, setShowArtworkClue] = useState(false);
  const [showArtworkUnlocked, setShowArtworkUnlocked] = useState(false);

  return (
    <ArtworkContext.Provider
      value={{
        currentArtwork,
        setCurrentArtwork,
        currentArtworkModel,
        viewedArtworks,
        setViewedArtworks,
        tappedArtwork,
        setTappedArtwork,
        showArtworkClue,
        setShowArtworkClue,
        showArtworkUnlocked,
        setShowArtworkUnlocked,
      }}
    >
      {children}
    </ArtworkContext.Provider>
  );
};
