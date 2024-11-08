// ArtworkContext.js
import { useContext, useState, useMemo, useEffect } from 'preact/hooks';
import { createContext } from 'preact/compat';
import { ARTWORKS, ArtworkId, ArtworkModel } from '../renderer/artworks';
import { useLocalStorageState } from 'ahooks';

export enum ArtworkState {
  NONE,
  PLACING,
  LOADING,
  VIEWING,
}
type ArtworkContextType = {
  artworkState: ArtworkState;
  setArtworkState: React.Dispatch<React.SetStateAction<ArtworkState>>;
  currentArtwork: ArtworkId | undefined;
  setCurrentArtwork: React.Dispatch<React.SetStateAction<ArtworkId | undefined>>;
  viewedArtworks: ArtworkId[] | undefined;
  setViewedArtworks: React.Dispatch<React.SetStateAction<ArtworkId[] | undefined>>;
  currentArtworkModel: ArtworkModel | undefined
};

export const ArtworkContext = createContext<ArtworkContextType>({
  artworkState: ArtworkState.NONE,
  setArtworkState: () => { },
  currentArtworkModel: undefined,
  viewedArtworks: [],
  setCurrentArtwork: () => { },
  setViewedArtworks: () => { },
  currentArtwork: undefined,
});

export const ArtworkProvider = ({ children }) => {
  const [currentArtwork, setCurrentArtwork] = useState<ArtworkId | undefined>(undefined);
  const [artworkState, setArtworkState] = useState<ArtworkState>(ArtworkState.NONE);

  const currentArtworkModel = useMemo(() => {
    return currentArtwork ? ARTWORKS[currentArtwork] : undefined;
  }, [currentArtwork]);

  const [viewedArtworks, setViewedArtworks] = useLocalStorageState<ArtworkId[] | undefined>('viewedArtworks', {
    defaultValue: [],
  });

  useEffect(() => {
    if (currentArtwork && viewedArtworks) {
      if (!viewedArtworks.includes(currentArtwork)) {
        setViewedArtworks([...viewedArtworks, currentArtwork]);
      }
    }
  }, [currentArtwork, viewedArtworks, setViewedArtworks]);

  // const [tappedArtwork, setTappedArtwork] = useState(null);
  // const [showArtworkClue, setShowArtworkClue] = useState(false);
  // const [showArtworkUnlocked, setShowArtworkUnlocked] = useState(false);
  // }

  return (
    <ArtworkContext.Provider
      value={{
        artworkState,
        setArtworkState,
        currentArtwork,
        setCurrentArtwork,
        currentArtworkModel,
        viewedArtworks,
        setViewedArtworks,
        // tappedArtwork,
        // setTappedArtwork,
        // showArtworkClue,
        // setShowArtworkClue,
        // showArtworkUnlocked,
        // setShowArtworkUnlocked,
      }}
    >
      {children}
    </ArtworkContext.Provider>
  );
};
