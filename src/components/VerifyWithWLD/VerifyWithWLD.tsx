import {
  MiniKit,
  ResponseEvent,
  VerificationLevel,
  MiniAppVerifyActionPayload,
  ISuccessResult,
} from '@worldcoin/minikit-js';
import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../../store/index';
import { useRouter } from 'next/navigation';
import { verifyUser } from '@/http';

export type VerifyCommandInput = {
  action: string;
  signal?: string;
  verification_level?: VerificationLevel; // Default: Orb
};

// verify

const verifyPayload: VerifyCommandInput = {
  action: 'verify', // This is your action ID from the Developer Portal
  signal: '',
  verification_level: VerificationLevel.Device, // Orb | Device
};

const triggerVerify = () => {
  const res = MiniKit.commands.verify(verifyPayload);
  res?.signal;
};

interface IProps {
  walletOnly?: boolean;
}

export const VerifyBlock: FC<IProps> = ({ walletOnly = false }) => {
  const dispatch = useDispatch<Dispatch>();

  const router = useRouter();
  const [installed, setInstalled] = useState(false);
  const [nonce, setNonce] = useState('');

  const { user } = useSelector((state: RootState) => state.auth);

  const handleUpdateUserVerifiedStatus = async () => {
    try {
      await verifyUser();
    } catch (err: any) {
      console.log(err.message);
    } finally {
      router.replace('/designYourBadge');
    }
  };

  const signInWithWallet = async () => {
    try {
      const res = await fetch(`/api/nonce`);
      console.log("test:res", res)
      const { nonce } = await res.json();
      const generateMessageResult = MiniKit.commands.walletAuth({
        nonce: nonce,
        requestId: '0', // Optional
        expirationTime: new Date(
          new Date().getTime() + 7 * 24 * 60 * 60 * 1000
        ),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement:
          'This is my statement and here is a link https://worldcoin.com/apps',
      });
      setNonce(nonce);
    } catch (err: any) {
      console.log("test:signInWithWallet :err", err)
      // setwWallet('Error in data');
    }
  };

  useEffect(() => {
    let inerval: any = null;
    if (!installed) {
      inerval = setInterval(() => {
        if (MiniKit.isInstalled()) {
          setInstalled(true);
          clearInterval(inerval);
        }
      }, 500);
    }
    return () => {
      clearInterval(inerval);
    };
  }, [installed]);

  useEffect(() => {
    if (!MiniKit.isInstalled()) {
      console.log('MiniKit not installed!');
      return;
    }

    if (installed && user) {
      setTimeout(() => {
        signInWithWallet();
        // triggerVerify();
      }, 1000);
    }

    MiniKit.subscribe(
      ResponseEvent.MiniAppVerifyAction,
      async (response: MiniAppVerifyActionPayload) => {
        if (response.status === 'error') {
          if (!walletOnly) {
            router.replace('/designYourBadge');
          }
          return console.log('Error payload', response);
        }

        // Verify the proof in the backend
        const verifyResponse = await fetch('/api/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payload: response as ISuccessResult, // Parses only the fields we need to verify
            action: verifyPayload.action,
            signal: verifyPayload.signal, // Optional
          }),
        });

        // TODO: Handle Success!
        const verifyResponseJson = await verifyResponse.json();

        if (verifyResponseJson?.verifyRes?.success) {
          handleUpdateUserVerifiedStatus();
        } else {
          handleUpdateUserVerifiedStatus();
        }
      }
    );
    MiniKit.subscribe(ResponseEvent.MiniAppWalletAuth, async payload => {
      if (payload.status === 'error') {
        if (!user?.is_verified && !walletOnly) {
          triggerVerify();
        } else {
          if (!walletOnly) {
            router.replace('/designYourBadge');
          }
        }
        return;
      } else {
        console.log("test:payload", payload)
        const response = await fetch('/api/complete-siwe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payload: payload,
            nonce,
          }),
        });
        console.log("test:response", response)
        const walletAddress = MiniKit.walletAddress ?? '';
        dispatch.auth.setWLDWallet_address(walletAddress);
        if (!user?.is_verified && !walletOnly) {
          triggerVerify();
        } else {
          if (!walletOnly) {
            router.replace('/designYourBadge');
          }
        }
      }
    });

    return () => {
      MiniKit.unsubscribe(ResponseEvent.MiniAppVerifyAction);
      MiniKit.unsubscribe(ResponseEvent.MiniAppWalletAuth);
    };
  }, [installed, user]);
  console.log("test:nounce", nonce,"build deploy 06:pm")
  return <div></div>;
};
