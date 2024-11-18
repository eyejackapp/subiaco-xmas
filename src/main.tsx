import { render } from 'preact';
import { App } from './app.tsx';
import './style.css';
import ReactGA from 'react-ga4';
import * as Sentry from '@sentry/react';
import { AppStateProvider } from './context/AppStateContext.tsx';
import { RendererProvider } from './context/RendererContext.tsx';
import { ArtworkProvider } from './context/ArtworkContext.tsx';
import { UserFormProvider } from './hooks/useUserForm.tsx';

// ReactGA.initialize('G-J314S16GFS');

// if (import.meta.env.PROD) {
Sentry.init({
    dsn: "https://09c5952301501726701f5266c8de19ed@o1388406.ingest.us.sentry.io/4508316281929728",
    integrations: [
        Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
});
// }

render(<AppStateProvider><RendererProvider><ArtworkProvider><UserFormProvider><App /></UserFormProvider></ArtworkProvider></RendererProvider></AppStateProvider>, document.getElementById('app')!);
