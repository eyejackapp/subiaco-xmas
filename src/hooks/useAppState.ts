import { useContext } from "preact/hooks";
import { AppStateContext } from "../context/AppStateContext";

export const useAppState = () => {
    const context = useContext(AppStateContext);
    if (!context) {
      throw new Error('useApp must be used within an AppStateProvider');
    }
    return context;
  };
