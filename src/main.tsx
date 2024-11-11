import { render } from 'preact';
import { App } from './app.tsx';
import './style.css';
import ReactGA from 'react-ga4';
import * as Sentry from '@sentry/react';
import { AppStateProvider } from './context/AppStateContext.tsx';
import { RendererProvider } from './context/RendererContext.tsx';
import { ArtworkProvider } from './context/ArtworkContext.tsx';
import { UserFormProvider } from './hooks/useUserForm.tsx';

// ReactGA.initialize('G-L0317D6T4W');

// if (import.meta.env.PROD) {
//     Sentry.init({
//         dsn: 'https://b9df91503a25289a9e03e6b9f61f6faa@o4506630415319040.ingest.sentry.io/4506630416891904',
//         integrations: [],
//     });
// }

render(<AppStateProvider><RendererProvider><ArtworkProvider><UserFormProvider><App /></UserFormProvider></ArtworkProvider></RendererProvider></AppStateProvider>, document.getElementById('app')!);
