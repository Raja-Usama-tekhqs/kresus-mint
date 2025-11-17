import { createContext, useContext, useEffect, useState, FC } from 'react';
import posthog from 'posthog-js';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, Dispatch } from '@/store';
import { getJWTToken } from '@/components/AppLocalStorage/AppLocalStorage';

type PostHogContextType = {
  setUserId: (id: string) => void;
  trackEvent: (event: string, data?: { [x: string]: any }) => void;
};

const PostHogContext = createContext<PostHogContextType | undefined>(undefined);

const PostHogProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<Dispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');

  const setUserId = (id: string) => {
    posthog.identify(id);
  };

  const trackEvent = (event: string, data?: { [x: string]: any }) => {
    posthog.capture(event, { email, ...data });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      posthog.init("phc_uedtwgGckpoR4jscVWC7ou84E9clPhHnMqDMbLcNLsc", {
        api_host:'https://us.i.posthog.com',
        autocapture: true,
        capture_pageview: true,
        debug: true,
      });
    }
  }, []);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      setUserId(user.email);
    }
  }, [user]);

  useEffect(() => {
    const token = getJWTToken();
    if (token) {
      dispatch.auth.handleGetUser();
    }
  }, []);

  return (
    <PostHogContext.Provider value={{ setUserId, trackEvent }}>
      {children}
    </PostHogContext.Provider>
  );
};

export const useAmplitude = () => {
  const context = useContext(PostHogContext);
  if (!context) {
    throw new Error('usePostHog must be used within a PostHogProvider');
  }
  return context;
};

export default PostHogProvider;


// import { createContext, FC, useContext, useEffect, useState } from 'react';
// import * as amplitude from '@amplitude/analytics-browser';

// import { useSelector, useDispatch } from 'react-redux';
// import { RootState, Dispatch } from '@/store';
// import { getJWTToken } from '@/components/AppLocalStorage/AppLocalStorage';

// type AmplitudeContextType = {
//   setUserId: (id: string) => void;
//   trackEvent: (event: string, data?: { [x: string]: any }) => void;
// };

// const AmplitudeContext = createContext<AmplitudeContextType | undefined>(
//   undefined
// );

// const AmplitudeProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
//   const dispatch = useDispatch<Dispatch>();
//   const { user } = useSelector((state: RootState) => state.auth);
//   const [email, setEmail] = useState('');
//   const setUserId = (id: string) => {
//     amplitude.setUserId(id);
//   };

//   const trackEvent = (
//     event: string,
//     data: { [x: string]: any } | undefined
//   ) => {
//     if (data) {
//       amplitude.track(event, { email, ...data });
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       setEmail(user.email);
//       setUserId(user.email);
//     }
//   }, [user]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!);
//     }
//   }, []);

//   useEffect(() => {
//     const token = getJWTToken();
//     if (token) {
//       dispatch.auth.handleGetUser();
//     }
//   }, []);

//   return (
//     <AmplitudeContext.Provider value={{ setUserId, trackEvent }}>
//       {children}
//     </AmplitudeContext.Provider>
//   );
// };

// export const useAmplitude = () => {
//   const context = useContext(AmplitudeContext);
//   if (!context) {
//     throw new Error('useAmplitude must be used within an AmplitudeProvider');
//   }
//   return context;
// };

// export default AmplitudeProvider;

