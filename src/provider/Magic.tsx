import React, { FC, useEffect } from 'react';

import MagicProvider from '@/components/magic/MagicProvider';

interface IProps {
  children: React.ReactNode;
}

const Magic: FC<IProps> = ({ children }) => {
  useEffect(() => {
    if (window) {
      // @ts-ignore
      window.Browser = { T: () => {} };
    }
  }, []);
  return <MagicProvider>{children}</MagicProvider>;
};

export default Magic;
