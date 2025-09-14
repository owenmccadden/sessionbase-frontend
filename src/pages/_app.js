import "@/styles/globals.css";
import { AuthProvider } from '../contexts/AuthContext';
import Head from 'next/head';
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
      <Head>
        <meta property="og:image" content="https://www.sessionbase.ai/sessionbase-og.png?v=2" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="SessionBase logo on branded background" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.sessionbase.ai/sessionbase-og.png?v=2" />
        <meta name="twitter:image:alt" content="SessionBase logo on branded background" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
