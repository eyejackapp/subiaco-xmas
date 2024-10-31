import { render } from 'preact';
import { App } from './app.tsx';
import './style.css';
import ReactGA from 'react-ga4';
import * as Sentry from '@sentry/react';

ReactGA.initialize('G-L0317D6T4W');

if (import.meta.env.PROD) {
    Sentry.init({
        dsn: 'https://b9df91503a25289a9e03e6b9f61f6faa@o4506630415319040.ingest.sentry.io/4506630416891904',
        integrations: [],
    });
}

render(<App />, document.getElementById('app')!);
