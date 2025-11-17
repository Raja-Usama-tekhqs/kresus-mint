import { getChainId, getNetworkUrl } from '../../provider/network';
import { OAuthExtension } from '@magic-ext/oauth';
import { ethers } from 'ethers';
import { Magic as MagicBase } from 'magic-sdk';
import { useDispatch } from 'react-redux';
import { Dispatch } from '@/store';
import { useRouter } from 'next/navigation';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
const { Web3 } = require('web3');

export type Magic = MagicBase<OAuthExtension[]>;

type MagicContextType = {
  magic: Magic | null;
  web3: typeof Web3 | null;
};

export const MagicContext = createContext<MagicContextType>({
  magic: null,
  web3: null,
});

export const useMagic = () => useContext(MagicContext);

const MagicProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const dispatch = useDispatch<Dispatch>();
  const [magic, setMagic] = useState<Magic | null>(null);
  const [web3, setWeb3] = useState<typeof Web3 | null>(null);

  const handleIfUserIsLoggedIn = async () => {
    try {
      dispatch.auth.setLoading(true);
      const isLoggedIn = await magic?.user.isLoggedIn();
      if (isLoggedIn) {
      } else {
        // magic?.user.logout();
        localStorage.clear();
        router.push('/');
      }
    } catch (err: any) {
      console.log(err.message);
    } finally {
      dispatch.auth.setLoading(false);
    }
  };

  useEffect(() => {
    console.log('magic setting');
    if (process.env.NEXT_PUBLIC_MAGIC_API_KEY) {
      if (!magic) {
        const _magic = new MagicBase(
          process.env.NEXT_PUBLIC_MAGIC_API_KEY as string,
          {
            network: {
              rpcUrl: getNetworkUrl(),
              chainId: getChainId(),
            },
            extensions: [new OAuthExtension()],
          }
        );

        // _magic.user.revealPrivateKey();

        setMagic(_magic);
        setWeb3(new Web3((_magic as any).rpcProvider));
      }
    }
  }, []);

  useEffect(() => {
    if (magic) {
      handleIfUserIsLoggedIn();
    }
  }, [magic]);

  const value = useMemo(() => {
    return {
      magic,
      web3,
    };
  }, [magic, web3]);

  return (
    <MagicContext.Provider value={value}>{children}</MagicContext.Provider>
  );
};

export default MagicProvider;
