import { useContext } from "preact/hooks";
import { RendererContext } from "../context/RendererContext";

export const useRenderer = () => {
    const context = useContext(RendererContext);
    if (!context) {
      throw new Error('useApp must be used within an RendererProvider');
    }
    return context;
  };
