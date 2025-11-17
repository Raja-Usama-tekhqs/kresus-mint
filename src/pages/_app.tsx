import { AuthProvider } from '@/components/Context/AuthProvider';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '../store/index';
import Script from 'next/script';
import MagicProvider from '@/components/magic/MagicProvider';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MiniKitProvider from '@/provider/worldChain';
import AmplitudeProvider from '@/provider/Amplitude';

export default function App({ Component, pageProps }: AppProps) {
  const [windowSet, setWindowSet] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.Browser = {
        T: () => {},
      };
      setWindowSet(true);
    }
  }, []);
  return (
    <>
      <Script id='custom-script' strategy='beforeInteractive'>
        {`
        if (typeof window !== 'undefined') {
          // @ts-ignore
          window.Browser = {
            T: () => {},
          };
        }
      `}
      </Script>
      {windowSet && (
        <MiniKitProvider>
          <Provider store={store}>
            <AuthProvider>
              <AmplitudeProvider>
                <MagicProvider>
                  <Component {...pageProps} />
                </MagicProvider>
              </AmplitudeProvider>
              <ToastContainer />
            </AuthProvider>
          </Provider>
        </MiniKitProvider>
      )}
    </>
  );
}
