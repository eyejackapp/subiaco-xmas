import { createContext, ReactNode } from 'preact/compat';
import { useState } from 'preact/hooks';

export enum AppState {
  SPLASH = 'SPLASH',
  AR_LOADING = 'AR_LOADING',
  ONBOARDING = 'ONBOARDING',
  ARTWORK_VIEWING = 'ARTWORK_VIEWING',
  ARTWORK_UNLOCKED = 'ARTWORK_UNLOCKED',
  CONGRATULATIONS = 'CONGRATULATIONS',
  MEDIA_SHARE = 'MEDIA_SHARE'
}

export type AppStateContext = {
  appState: AppState;
  setAppState: (state: AppState) => void;
}

export const AppStateContext = createContext<AppStateContext | null>(null);

export type AppStateProviderProps = {
  children: ReactNode;
}
export const AppStateProvider = ({ children }: AppStateProviderProps) => {
  const [appState, setAppState] = useState<AppState>(AppState.SPLASH);

  return (
    <AppStateContext.Provider value={{ appState, setAppState }}>
      {children}
    </AppStateContext.Provider>
  );
};


