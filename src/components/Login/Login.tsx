import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMagic } from '../magic/MagicProvider';

import {
  getJWTToken,
  getToken,
  saveUserInfo,
} from '../AppLocalStorage/AppLocalStorage';
import { MiniKit } from '@worldcoin/minikit-js';
import Image from 'next/image';
import TextField from '../AppTextBox/AppTextBox';
import { assets } from '@/assets';
import { useAuth } from '../Context/AuthProvider';
import { onboardingHelper } from '@/pages/api/apiCalls';
import { ethers } from 'ethers';
import { ChainId, CoreEnv, VaultFactory } from '@kresuslabs/core';
import { getNetworkUrl } from '@/provider/network';
import { mockSentry } from '@/utils/sentry';
import { ClipLoader } from 'react-spinners';

import { useDispatch } from 'react-redux';
import { Dispatch } from '@/store';
import RewardTimer from '../RewardTimer/RewardTimer';
import Typography from '../Typography/Typography';
import { useAmplitude } from '@/provider/Amplitude';
import { sleep } from '@/utils/common';

const Login = () => {
  const router = useRouter();
  const { trackEvent } = useAmplitude();
  const { magic } = useMagic();

  const dispatch = useDispatch<Dispatch>();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>('');
  const [isLoginInProgress, setLoginInProgress] = useState(false);
  const { setTokenPromise, resendOTP, setResendOTP } = useAuth();
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const token = getJWTToken();

  const handleLogin = async () => {
    try {
      dispatch.nft.setNfts([]);
      if (
        !email.match(
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
        )
      ) {
        setEmailError('Invalid Email');

        trackEvent('email_submit_disabled', {
          error_message: 'Invalid email format',
        });
        trackEvent('email_validation_triggered', {
          email_format_valid: false,
        });
        return null;
      }
      trackEvent('email_validation_triggered', {
        email_format_valid: true,
      });
      trackEvent('email_submitted', {
        email: email,
        screen: 'OTP Screen',
      });

      localStorage.clear();
      setLoginInProgress(true);
      setEmailError('');

      const isLoggedIn = await magic?.user.isLoggedIn();
      console.log(isLoggedIn);
      if (isLoggedIn) {
        console.log('Logging out user');
        await magic?.user.logout();
      }

      const token: any = magic?.auth.loginWithEmailOTP({
        email,
        showUI: false,
        lifespan: 604800,
      });
      //checks if the email is sent or not
      localStorage.setItem('Email', email);
      dispatch.auth.setEmail(email);

      token
        .on('email-otp-sent', () => {
          console.log('email-otp-sent ---------', token);
          setTokenPromise(token);
          setResendOTP(false);
          router.push('./verificationCode');

          //navigate to the verification page < token>
        }) // @ts-ignore
        ?.on('error', reason => {
          try {
            console.log('email-otp-sent-error ---------');
            setLoginInProgress(false);
            setEmailError('Please provide a valid email address');
            trackEvent('email_submit_disabled', {
              error_message: 'Invalid email format',
            });
          } catch (error) {
            console.log('error', error);
          }
        })
        .on('settled', async () => {
          console.log('email-otp-sent-settled ---------', token);
          const metadata = await magic?.user.getMetadata();

          if (!token || !metadata?.publicAddress) {
            // throw new Error("Magic login failed");
            return null;
          }

          localStorage.setItem('user', JSON.stringify(metadata));
          dispatch.auth.setUser({
            email: metadata.email!,
            publicAddress: metadata.publicAddress,
            isMfaEnabled: metadata.isMfaEnabled,
            phoneNumber: metadata.phoneNumber,
            recoveryFactors: metadata.recoveryFactors,
            issuer: metadata.issuer,
          });
          // setUser(metadata);
          // // }

          localStorage.setItem('access_token', await magic?.user.getIdToken()!);

          const accessToken = await magic?.user.getIdToken()!;

          const provider = new ethers.providers.Web3Provider(
            magic?.rpcProvider as any
          );

          const signer = provider.getSigner();

          console.log(signer);

          const address = await signer.getAddress();
          console.log(address);

          const _factory = new VaultFactory({
            rpcUrl: getNetworkUrl(),
            chainId: ChainId.BASE_SEPOLIA,
            env: CoreEnv.dev,
            magicProvider: provider,
            gasManagerPolicyId: process.env.NEXT_PUBLIC_POLICY_ID!,
            sentry: mockSentry,
          });

          const vaultAddress = await _factory.getAddress(accessToken!);

          console.log('vaultAddress', vaultAddress);

          localStorage.setItem('vault_address', vaultAddress);
          dispatch.auth.setVaultAddress(vaultAddress);

          console.log(vaultAddress);

          const userInfo = await magic?.user.getInfo();
          console.log(`UserInfo: ${JSON.stringify(userInfo)}`);
          const _token = await magic?.user.getIdToken();
          localStorage.setItem('access_token', _token ?? '');
          saveUserInfo(_token ?? '', 'EMAIL', metadata?.publicAddress ?? ''); //storing here
          localStorage.setItem('user', JSON.stringify(metadata));

          dispatch.auth.setUser({
            email: metadata.email!,
            publicAddress: metadata.publicAddress,
            isMfaEnabled: metadata.isMfaEnabled,
            phoneNumber: metadata.phoneNumber,
            recoveryFactors: metadata.recoveryFactors,
            issuer: metadata.issuer,
          });
          //  could be modified
          await onboardingHelper({
            token: getToken(),
            vaultAddress: vaultAddress,
          });
          if (localStorage.getItem('Email')) {
            localStorage.removeItem('Email');
          }
          localStorage.setItem('Email', email);
          dispatch.auth.handleGetUser();
          await sleep(1000);
          router.push('./designYourBadge');
        });

      // //  recieves the otp
      // token?.emit('verify-email-otp', code)
      // token?.on('invalid-email-otp', () => {

      // })
      // // @ts-ignore
      // ?.on('done', async (result: string) => {

      // })
      // // @ts-ignore
      // ?.on('error', reason => {

      // })
      // ?.on('settled', () => {
      //   // is called when the Promise either resolves or rejects
      // })
      //  verification

      // if (!token || !metadata?.publicAddress) {
      //   // throw new Error("Magic login failed");
      //   setEmailError("Login Failed")
      //   setLoginInProgress(false)
      //   return null;
      // }

      // localStorage.setItem("user", JSON.stringify(metadata));
      // // setUser(metadata);
      // // // }

      // localStorage.setItem("access_token", await magic?.user.getIdToken()!);
      // // save user info
      // // setToken(token);

      // // setEmail("");
    } catch (error) {
      console.error(error);
    }
  };

  if (token) {
    setTimeout(() => {
      if (MiniKit.isInstalled()) {
        router.replace('/verify-with-wld');
      } else {
        router.replace('/designYourBadge');
      }
    }, 500);
    return null;
  }

  useEffect(() => {
    if (email.trim().length) {
      setButtonEnabled(true);
    } else {
      setButtonEnabled(false);
    }
  }, [email]);

  useEffect(() => {
    if (buttonEnabled) {
      trackEvent('email_submit_enabled', {
        email: email,
      });
    }
  }, [buttonEnabled]);

  return (
    <div className='h-[100dvh]'>
      <div className=' min-h-[100dvh] w-full absolute  flex flex-col'>
        <div className='flex-grow bg-bg_gradient mb-[-60px]'></div>
        <div className='mt-auto'>
          <div className='flex items-center h-[60px]'>
            <div className='relative w-[50%] h-[60px]'>
              <Image src='/land1.png' alt='' fill />
            </div>
            <div className='absolute right-0 w-[70%] h-[60px]'>
              <Image src='/land2.png' alt='' fill />
            </div>
          </div>
          <div className='relative h-[120px]'>
            <Image src='/waves.png' fill alt='' />
          </div>
        </div>
      </div>
      <div className='absolute w-full flex flex-col px-[24px] pb-[30px] items-center justify-between align-middle h-[100dvh] z-30 '>
        <div className='flex flex-col justify-center items-center  mt-[35px] w-[100%]'>
          <Image src={assets.logo} width={42.5} height={50} alt='Kresus logo' />
          <Typography
            variant='2xl'
            className='mt-5 leading-[30px] text-center'
            family='beirut'
          >
            Verify Your Email <br /> to Get Started
          </Typography>
          <div className='mt-[30px] w-full'>
            <TextField
              label='Enter Email'
              showButton
              value={email}
              disabled={isLoginInProgress}
              onClear={() => {
                if (isLoginInProgress) {
                  return;
                }
                trackEvent('email_submit_disabled');
                setEmail('');
              }}
              onChange={e => {
                if (emailError) setEmailError('');

                setEmail(e.target.value);
              }}
            />
          </div>

          {emailError && (
            <span className='w-[100%] pl-[10px] text-[12px] text-[red] text-left'>
              {emailError}
            </span>
          )}
        </div>
         {/* Remove prize change 1 */}
        {/* <div className='p-4 mt-auto mb-[80px] w-full'>
          <RewardTimer />
        </div> */}
        <button
          onClick={handleLogin}
          className='access-my-photos font-[660] !mb-6 min-h-[55px] disabled:bg-[#0734A9] disabled:text-[#01032C] max-w-[100vw] w-full flex items-center justify-center'
          disabled={isLoginInProgress || !email.trim()}
        >
          {isLoginInProgress ? (
            <ClipLoader size={20} color='#fff' />
          ) : (
            'Get Verification Code'
          )}
        </button>
      </div>
    </div>
  );
};

export default Login;
