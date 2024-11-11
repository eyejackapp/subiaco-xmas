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
  isSurveyOpen: boolean;
  setIsSurveyOpen: (isOpen: boolean) => void;
  showThankYouModal: boolean;
  setShowThankYouModal: (isOpen: boolean) => void;
}

export const AppStateContext = createContext<AppStateContext | null>(null);

export type AppStateProviderProps = {
  children: ReactNode;
}
export const AppStateProvider = ({ children }: AppStateProviderProps) => {
  const [appState, setAppState] = useState<AppState>(AppState.SPLASH);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  return (
    <AppStateContext.Provider value={{ appState, setAppState, isSurveyOpen, setIsSurveyOpen, showThankYouModal, setShowThankYouModal }}>
      {children}
    </AppStateContext.Provider>
  );
};


