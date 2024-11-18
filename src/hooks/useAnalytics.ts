import { useCallback, useRef } from 'react';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const useAnalytics = (userId: string) => {
  const isInitialized = useRef(false);

  const initAnalytics = useCallback(
    (tag: string) => {
      return new Promise<void>((resolve, reject) => {
      if (!userId) {
        console.warn('No user ID provided.');
        return;
      }
      if (isInitialized.current) {
        console.warn('Google Analytics is already initialized.');
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${tag}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;

      script.onload = () => {
        window.gtag('js', new Date());
        window.gtag('config', tag, {
          user_id: userId || 'anonymous',
          send_page_view: true,
        });

        isInitialized.current = true;
        resolve();
      };
    })
  },
    [isInitialized, userId]
  );

  const sendEvent = useCallback(
    (eventName: string, eventParams: { [key: string]: any } = {}) => {
      if (!isInitialized.current) {
        console.warn('Google Analytics is not initialized. Call init() first.');
        return;
      }
      eventParams['user_id'] = userId;
      window.gtag('event', eventName, eventParams);
      // console.log('GA: page_view app', document.title, window.location.pathname);

    },
    [isInitialized, userId]
  );

  return { initAnalytics, sendEvent };
};

export default useAnalytics;
