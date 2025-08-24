import "@/styles/globals.css";
import { AuthProvider } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { initMixpanel, trackPageView } from '../utils/mixpanel';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    initMixpanel();

    const handleRouteChange = (url) => {
      trackPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
