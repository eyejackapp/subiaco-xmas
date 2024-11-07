// ArtworkContext.js
import { useContext, useState, useMemo} from 'preact/hooks';
import { createContext } from 'preact/compat';
import { ARTWORKS, ArtworkId, ArtworkModel } from '../renderer/artworks';
import { useLocalStorageState } from 'ahooks';

type ArtworkContextType = {
  currentArtwork?: ArtworkId;
  setCurrentArtwork: (id: ArtworkId) => void;
  viewedArtworks: ArtworkId[];
  currentArtworkModel: ArtworkModel | undefined
};

const ArtworkContext = createContext<ArtworkContextType>({
  currentArtworkModel: undefined,
  viewedArtworks: [],
  setCurrentArtwork: () => {},
  currentArtwork: undefined
});
// {
//   currentArtwork: '',
//   setCurrentArtwork: '',
//   currentArtworkModel: '',
//   viewedArtworks: '',
//   setViewedArtworks: '',
//   tappedArtwork: '',
//   setTappedArtwork: '',
//   showArtworkClue: '',
//   setShowArtworkClue: '',
//   showArtworkUnlocked: '',
//   setShowArtworkUnlocked: '',
// }


export const useArtwork = () => {
  return useContext(ArtworkContext);
};

export const ArtworkProvider = ({ children }) => {
  const [currentArtwork, setCurrentArtwork] = useState<ArtworkId | undefined>(undefined);
  console.log('current artwork', currentArtwork)
  const currentArtworkModel = useMemo(() => {
    return currentArtwork ? ARTWORKS[currentArtwork] : undefined;
  }, [currentArtwork]);

  const [viewedArtworks, setViewedArtworks] = useLocalStorageState('viewedArtworks', {
    defaultValue: [],
  });

  // const [tappedArtwork, setTappedArtwork] = useState(null);
  // const [showArtworkClue, setShowArtworkClue] = useState(false);
  // const [showArtworkUnlocked, setShowArtworkUnlocked] = useState(false);
  console.log('viewed artworks', viewedArtworks)
  return (
    <ArtworkContext.Provider
      value={{
        currentArtwork,
        setCurrentArtwork,
        currentArtworkModel,
        viewedArtworks,
        // setViewedArtworks,
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
