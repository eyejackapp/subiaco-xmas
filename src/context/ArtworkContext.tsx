// ArtworkContext.js
import { useContext, useState, useMemo, useEffect } from 'preact/hooks';
import { createContext } from 'preact/compat';
import { ARTWORKS, ArtworkId, ArtworkModel } from '../renderer/artworks';
import { useLocalStorageState } from 'ahooks';
import { c } from 'vite/dist/node/types.d-aGj9QkWt';

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
  tappedArtworkModel: ArtworkModel | undefined;
  tappedArtwork: ArtworkId | null;
  setTappedArtwork: (artwork: ArtworkId | null) => void;
  showArtworkUnlocked: boolean;
  setShowArtworkUnlocked: (value: boolean) => void;
  regularArtworks: ArtworkId[] | undefined;
  showArtworkTapped: boolean;
  setShowArtworkTapped: (value: boolean) => void;

};

export const ArtworkContext = createContext<ArtworkContextType>({
  artworkState: ArtworkState.NONE,
  setArtworkState: () => { },
  currentArtworkModel: undefined,
  tappedArtworkModel: undefined,
  viewedArtworks: [],
  setCurrentArtwork: () => { },
  setViewedArtworks: () => { },
  currentArtwork: undefined,
  tappedArtwork: null,
  setTappedArtwork: () => { },
  showArtworkUnlocked: false,
  setShowArtworkUnlocked: () => { },
  regularArtworks: [],
  showArtworkTapped: false,
  setShowArtworkTapped: () => { },
  // artworkToShow: null,
  // setArtworkToShow: () => { },
});

export const ArtworkProvider = ({ children }) => {
  const [currentArtwork, setCurrentArtwork] = useState<ArtworkId | undefined>(undefined);
  const [artworkState, setArtworkState] = useState<ArtworkState>(ArtworkState.NONE);
  const [showArtworkUnlocked, setShowArtworkUnlocked] = useState(false);
  const [showArtworkTapped, setShowArtworkTapped] = useState(false);
  const [tappedArtwork, setTappedArtwork] = useState<ArtworkId | null>(null);
  // const [artworkToShow, setArtworkToShow] = useState(tappedArtwork || currentArtwork);
  const currentArtworkModel = useMemo(() => {
    return currentArtwork ? ARTWORKS[currentArtwork] : undefined;
  }, [currentArtwork]);

  const tappedArtworkModel = useMemo(() => {
    return tappedArtwork ? ARTWORKS[tappedArtwork] : undefined;
  }, [tappedArtwork]);

  const [viewedArtworks, setViewedArtworks] = useLocalStorageState<ArtworkId[] | undefined>('viewedArtworks', {
    defaultValue: [],
  });

  const regularArtworks = useMemo(() => viewedArtworks?.filter((artwork) => !artwork.startsWith('bonus')), [viewedArtworks]);


  return (
    <ArtworkContext.Provider
      value={{
        artworkState,
        setArtworkState,
        currentArtwork,
        setCurrentArtwork,
        currentArtworkModel,
        tappedArtworkModel,
        viewedArtworks,
        setViewedArtworks,
        tappedArtwork,
        setTappedArtwork,
        showArtworkUnlocked,
        setShowArtworkUnlocked,
        regularArtworks,
        showArtworkTapped,
        setShowArtworkTapped
        // artworkToShow,
        // setArtworkToShow
      }}
    >
      {children}
    </ArtworkContext.Provider>
  );
};
