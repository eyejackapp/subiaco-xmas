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
  currentArtworkModel: ArtworkModel | undefined;
  tappedArtwork: ArtworkId | null;
  setTappedArtwork: (artwork: ArtworkId | null) => void;
  showArtworkUnlocked: boolean;
  setShowArtworkUnlocked: (value: boolean) => void;

};

export const ArtworkContext = createContext<ArtworkContextType>({
  artworkState: ArtworkState.NONE,
  setArtworkState: () => { },
  currentArtworkModel: undefined,
  viewedArtworks: [],
  setCurrentArtwork: () => { },
  setViewedArtworks: () => { },
  currentArtwork: undefined,
  tappedArtwork: null,
  setTappedArtwork: () => { },
  showArtworkUnlocked: false,
  setShowArtworkUnlocked: () => { },
});

export const ArtworkProvider = ({ children }) => {
  const [currentArtwork, setCurrentArtwork] = useState<ArtworkId | undefined>(undefined);
  const [artworkState, setArtworkState] = useState<ArtworkState>(ArtworkState.NONE);
  const [showArtworkUnlocked, setShowArtworkUnlocked] = useState(false);

  const currentArtworkModel = useMemo(() => {
    return currentArtwork ? ARTWORKS[currentArtwork] : undefined;
  }, [currentArtwork]);

  const [viewedArtworks, setViewedArtworks] = useLocalStorageState<ArtworkId[] | undefined>('viewedArtworks', {
    defaultValue: [],
  });

  const [tappedArtwork, setTappedArtwork] = useState<ArtworkId | null>(null);

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
        tappedArtwork,
        setTappedArtwork,
        showArtworkUnlocked,
        setShowArtworkUnlocked,
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
