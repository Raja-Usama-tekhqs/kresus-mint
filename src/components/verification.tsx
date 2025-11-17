import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from './Context/AuthProvider';
import { useMagic } from './magic/MagicProvider';
import { ethers } from 'ethers';
import Image from 'next/image';
import OTPInput from 'react-otp-input';
import { assets } from '@/assets';
import { ChainId, CoreEnv, VaultFactory } from '@kresuslabs/core';
import { getNetworkUrl } from '@/provider/network';
import { mockSentry } from '@/utils/sentry';
import {
  getJWTToken,
  getToken,
  saveUserInfo,
} from './AppLocalStorage/AppLocalStorage';
import classNames from 'classnames';
import { onboardingHelper } from '@/pages/api/apiCalls';
import { MiniKit } from '@worldcoin/minikit-js';
import { ClipLoader } from 'react-spinners';

import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '@/store';
import { useAmplitude } from '@/provider/Amplitude';
import { sleep } from '@/utils/common';

function Verification() {
  const router = useRouter();

  const dispatch = useDispatch<Dispatch>();
  const token = getJWTToken();
  const { trackEvent } = useAmplitude();

  const [otp, setOtp] = useState('');
  const { tokenPromise, setResendOTP, setTokenPromise, resendOTP } = useAuth();
  const { email } = useSelector((state: RootState) => state.auth);
  const { magic } = useMagic();
  const [errors, setErrors] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isnavigate, setIsnavigate] = useState(false);
  const [coming, setComing] = useState('designYourBadge');
  useEffect(() => {
    if (otp.length === 6) {
      handleOtpComplete();
    }
  }, [otp]);

  const handleResendCode = async () => {
    try {
      setResendOTP(true);
      setLoading(true);
      trackEvent('resend_code_triggered', {
        resend_code_available: true,
        time_elapsed: 60,
        screen: 'OTP Screen',
      });
      const _email = email; //localStorage.getItem("Email") ?? "";
      dispatch.auth.setEmail(_email);
      const email_ = _email !== '' ? _email : email;
      console.log('OTP EMAIL :', email_);
      console.log('OTP EMAIL :1');
      try {
        tokenPromise ? tokenPromise.emit('cancel') : null;
      } catch (error) {
        console.log('error', error);
      }

      console.log('OTP EMAIL :2');
      console.log('isLoggedIn ---------', await magic?.user.isLoggedIn());
      // if(await magic?.user.isLoggedIn()){
      // await magic?.user.logout();
      // }
      // setDisabled(true);

      // magic?.auth.
      if (email_) {
        const token: any = magic?.auth.loginWithEmailOTP({
          email: email_,
          showUI: false,
          lifespan: 604800,
        });

        console.log('OTP token :', token);
        setLoading(false);
        setTokenPromise(token);
        token
          .on('email-otp-sent', () => {
            console.log('email-otp-sent ---------', token);
            setResendOTP(true);

            //navigate to the verification page < token>
          }) // @ts-ignore
          .on('settled', async () => {
            trackEvent('otp_entered', {
              otp_valid: true,
              otp_entered: otp,
            });
            trackEvent('otp_verified', {
              otp,
            });

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

            localStorage.setItem(
              'access_token',
              await magic?.user.getIdToken()!
            );

            const accessToken = await magic?.user.getIdToken()!;

            const provider = new ethers.providers.Web3Provider(
              magic?.rpcProvider as any
            );

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
            dispatch.auth.handleGetUser();
            await sleep(1000);
            setIsnavigate(true);
            setComing('designYourBadge');
          });
      } else {
        console.log('Email is not found');
        setIsnavigate(true);
        setComing('home');
      }
      console.log('FINISH');
    } catch (err: any) {
      console.log(err.message);
    } finally {
    }
  };
  useEffect(() => {
    trackEvent('Test Event', { source: 'initial load' });
  }, []);
  useEffect(() => {
    if (isnavigate) {
      if (coming === 'designYourBadge') {
        // setTimeout(() => {
        if (MiniKit.isInstalled()) {
          router.push('/verify-with-wld');
        } else {
          router.push('/designYourBadge');
        }
        // }, 500);
      } else if (coming === 'MintCompete') {
        // setTimeout(() => {
        router.push('./MintCompete');
        // }, 500);
      } else if (coming === 'home') {
        // setTimeout(() => {
        router.push('/');
        // }, 500);
      }
    }
  }, [coming, isnavigate]);

  const handleOtpComplete = async () => {
    setDisabled(true);
    setLoading(true);
    console.log('OTP is complete:', otp);

    if (errors) {
      setErrors('');
    }

    if (tokenPromise) {
      try {
        tokenPromise.emit('verify-email-otp', otp);
        setResendOTP(false);
        tokenPromise
          .on('invalid-email-otp', () => {
            console.log('invalid-email-otp-error ---------');
            //
            setErrors('Invalid OTP');
            trackEvent('otp_entered', {
              otp_valid: false,
              otp_entered: otp,
            });

            setDisabled(false);
            setLoading(false);
          })
          // @ts-ignore
          ?.on('done', async (result: string) => {
            console.log('otp-done ---------');
            console.log('isLoggedIn ---------', await magic?.user.isLoggedIn());
            // const metadata = await magic?.user.getMetadata();

            // if (!tokenPromise || !metadata?.publicAddress) {
            //   // throw new Error("Magic login failed");
            //   return null;
            // }

            // localStorage.setItem('user', JSON.stringify(metadata));
            // // setUser(metadata);
            // // // }

            // localStorage.setItem(
            //   'access_token',
            //   await magic?.user.getIdToken()!
            // );

            // // setToken(token);
            // saveUserInfo(tokenPromise, 'EMAIL', metadata?.publicAddress);

            // const accessToken = await magic?.user.getIdToken()!;
            // localStorage.setItem('access_token', accessToken);
            // const provider = new ethers.providers.Web3Provider(
            //   magic?.rpcProvider as any
            // );
            // const signer = provider.getSigner();
            // const signature = await signer.signMessage('Hello World'); // sign
            // console.log(signature);

            // const _factory = new VaultFactory({
            //   rpcUrl: getNetworkUrl(),
            //   chainId: ChainId.BASE_MAINNET,
            //   env: CoreEnv.dev,
            //   magicProvider: provider,
            //   gasManagerPolicyId: process.env.NEXT_PUBLIC_POLICY_ID!,
            //   sentry: mockSentry,
            // });

            // const vaultAddress = await _factory.getAddress(accessToken!);
            // console.log('vaultAddress', vaultAddress);

            // localStorage.setItem('vault_address', vaultAddress);
            // setDisabled(false);
            // setLoading(false);
            // router.push('./designYourBadge');
          })
          // @ts-ignore
          ?.on('error', reason => {
            console.log('otp-error ---------');
            setErrors('Error');
            trackEvent('otp_entered', {
              otp_valid: false,
              otp_entered: otp,
            });
            setDisabled(false);
            setLoading(false);
          })
          .on('settled', async () => {
            if (!resendOTP) {
              const metadata = await magic?.user.getMetadata();
              trackEvent('otp_entered', {
                otp_valid: true,
                otp_entered: otp,
              });
              trackEvent('otp_verified', {
                otp,
              });

              if (!tokenPromise || !metadata?.publicAddress) {
                // throw new Error("Magic login failed");
                return null;
              }

              localStorage.setItem('user', JSON.stringify(metadata));
              // setUser(metadata);
              // // }

              localStorage.setItem(
                'access_token',
                await magic?.user.getIdToken()!
              );

              const accessToken = await magic?.user.getIdToken()!;

              const provider = new ethers.providers.Web3Provider(
                magic?.rpcProvider as any
              );

              const _factory = new VaultFactory({
                rpcUrl: getNetworkUrl(),
                chainId: ChainId.BASE_MAINNET,
                env: CoreEnv.dev,
                magicProvider: provider,
                gasManagerPolicyId: process.env.NEXT_PUBLIC_POLICY_ID!,
                sentry: mockSentry,
              });

              const vaultAddress = await _factory.getAddress(accessToken!);
              console.log('vaultAddress', vaultAddress);

              localStorage.setItem('vault_address', vaultAddress);

              console.log(vaultAddress);

              const userInfo = await magic?.user.getInfo();
              console.log(`UserInfo: ${JSON.stringify(userInfo)}`);
              const _token = await magic?.user.getIdToken();
              localStorage.setItem('access_token', _token ?? '');
              saveUserInfo(
                _token ?? '',
                'EMAIL',
                metadata?.publicAddress ?? ''
              ); //storing here
              localStorage.setItem('user', JSON.stringify(metadata));
              //  could be modified
              await onboardingHelper({
                token: getToken(),
                vaultAddress: vaultAddress,
              });
              dispatch.auth.handleGetUser();
              await sleep(1000);
              if (localStorage.getItem('Email')) {
                localStorage.removeItem('Email');
              }
              localStorage.setItem('Email', email);

              setComing('designYourBadge');
              setIsnavigate(true);
              // router.push('./designYourBadge');
            } else {
              setDisabled(false);
              setLoading(false);
            }
          });
      } catch (error) {
        console.error('Error during OTP verification:', error);
        setErrors('Error OTP verification');
        trackEvent('otp_entered', {
          otp_valid: false,
          otp_entered: otp,
        });
        setDisabled(false);
        setLoading(false);
        // Handle error
      }
    } else {
      console.log('Token promise not found');
      setDisabled(false);
      setLoading(false);
      // Handle missing token promise
    }
  };

  const handleBack = () => {
    try {
      tokenPromise ? tokenPromise.emit('cancel') : null;
    } catch (error) {
      console.log('error', error);
    }
    router.back();
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

  return (
    <div className={`h-[100dvh]`}>
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
          <div className='relative h-[172px]'>
            <Image src='/waves.png' fill alt='' />
          </div>
        </div>
      </div>
      <div
        style={{
          opacity: '1',
          transition: 'opacity 3s',
          ...(isnavigate && {
            opacity: 0,
          }),
        }}
        className='absolute w-full flex flex-col items-center align-middle h-[100dvh] '
      >
        <div className='flex w-full px-3 pt-[15px]'>
          <Image
            src={assets.back}
            width={35}
            height={35}
            onClick={handleBack}
            alt='chevron-back'
            className='cursor-pointer'
          />
        </div>
        <Image src={assets.logo} width={42.5} height={50} alt='Kresus logo' />
        <span className='text-[24px] mt-5 text-center text-[#ffffff] font-[Beirut] font-[460] leading-[30px] w-full'>
          Check Your Email
        </span>
        <div
          className='input-elements'
          style={{
            fontSize: 40,
            marginTop: 35,
            color: '#fff',
          }}
        >
          <OTPInput
            value={otp}
            onChange={v => {
              setOtp(v);
              setErrors('');
            }}
            numInputs={6}
            shouldAutoFocus
            inputType='number'
            renderInput={props => (
              <input
                {...props}
                disabled={disabled || loading}
                style={{ opacity: loading ? 0.5 : 1 }}
                className={classNames(
                  'h-[70px] w-[48px] text-[44px] focus:border-[#CEB55A] caret-[#CEB55A] !bg-[#00000014] font-[MessinaSans] font-[264]',
                  otp.length === 6 && '!border-[#CEB55A]',
                  errors && '!border-red-500'
                )}
              />
            )}
          />
          {/* {errors && <p className='text-[12px] text-[red] mt-1'>{errors}</p>} */}
        </div>
        {loading ? (
          <div className='mt-[59px]'>
            <ClipLoader size={30} color='#ffffff' />
          </div>
        ) : (
          <>
            <span
              style={{
                fontSize: 13,
                marginTop: 59,
                color: '#ADD2FD',
                textAlign: 'center',
              }}
              className='font-[MessinaSans] leading-[19px] font-medium'
            >
              Security code sent to <br /> {email}
            </span>

            <button
              className='rounded-[99px] text-white pt-[11.5px] pb-[14.5px] font-[660] font-[MessinaSans] px-[18px]'
              style={{
                marginTop: '25px',
                border: '1px solid #4898F3',
                background: 'transparent',
                color: '#FFFFFF',
                fontSize: '15px',
                lineHeight: '19px',
              }}
              disabled={disabled || loading}
              onClick={handleResendCode}
            >
              Resend Code
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Verification;
