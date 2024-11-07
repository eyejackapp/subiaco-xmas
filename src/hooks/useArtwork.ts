import { useContext } from "preact/hooks";
import { ArtworkContext } from "../context/ArtworkContext";

export const useArtwork = () => {
    const context = useContext(ArtworkContext);
    if (!context) {
      throw new Error('useApp must be used within an AppStateProvider');
    }
    return context;
  };
