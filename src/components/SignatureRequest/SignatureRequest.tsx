import { assets } from '@/assets';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  getTxCost,
  getNonce,
} from '@/components/AppLocalStorage/AppLocalStorage';
import { RootState } from '@/store';

import { useSelector } from 'react-redux';
import { useAmplitude } from '@/provider/Amplitude';

const SignatureRequest = ({
  setShowSignatures,
  showSignatures,
  nonce,
  price,
  setRejected,
}: any) => {
  const router = useRouter();
  const { trackEvent } = useAmplitude();
  const { vault_address } = useSelector((state: RootState) => state.auth);
  const [vaultAddress, setVaultAddress] = useState('');
  useEffect(() => {
    setVaultAddress(vault_address);
  }, [vault_address]);

  return (
    <>
      <div
        className={`fixed top-0 left-0 z-10 h-full w-full bg-[#00000033] flex items-end justify-center ${
          showSignatures ? 'show-modal' : 'hide-modal'
        }`}
        style={{
          backdropFilter: 'blur(2px)',
          fontFamily: 'MessinaSans, sans-serif',
        }}
      >
        <div className='w-full max-w-[420px] bg-white rounded-t-[20px] pb-6 pt-3'>
          <div className='w-[50px] h-[3px] bg-[#EBEBEE] mx-auto mb-3'></div>
          <div className='flex justify-center'>
            <Image className='cursor-pointer' src={assets.kresus} alt='' />
          </div>

          <div className='pt-[25px] pr-[24px] pl-[24px] pb-[40px] flex flex-col text-center'>
            <span className='text-[#181C1F] text-[21px] font-[775] leading-[24px]'>
              Signature Request
            </span>
            <span className='mt-[20px] text-[15px] font-[500] leading-[19px] text-center text-[#636E80]'>
              Only sign this message if you fully understand the content and
              trust the requesting site.
            </span>
          </div>

          <div className='w-[100%] text-center'>
            <span className='text-[#181C1F] text-[15px] font-[1000] leading-[19px]'>
              You Are Signing:
            </span>
          </div>

          <div
            style={{
              fontFamily: 'MessinaSans, sans-serif',
              padding: '20px 24px 0px',
              borderRadius: '8px',
              wordWrap: 'break-word',
              color: '#636E80',
              fontSize: '15px',
              lineHeight: '19px',
              fontWeight: '500',
              maxHeight: '300px',
              overflow: 'auto',
              scrollbarWidth: 'thin',
            }}
          >
            <p>Message:</p> <br />
            <p>Thank you for minting an NFT with Kresus!</p>
            <br />
            <p>
              Click to sign and accept the Kresus{' '}
              <a
                href='https://kresus.com/terms-and-conditions/'
                target='_blank'
                rel='norefferrer'
                className='underline'
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href='https://kresus.com/privacy-policy/'
                target='_blank'
                rel='norefferrer'
                className='underline'
              >
                Privacy Policy
              </a>{' '}
              when you choose to mint your NFT.
            </p>
            <br />
            <p>
              This transaction will trigger a blockchain transaction cost of{' '}
              {showSignatures && price && Number(price).toFixed(6)} ETH as
              stated in the previous review screen and your NFT will be
              available in your Kresus Wallet.
            </p>
            <p>
              You can download the Kresus app at any time from your preferred
              app store.
            </p>
            <p className='my-3 font-bold'>Wallet Address:</p>
            <span className='mt-3'>
              {vaultAddress
                ? vaultAddress
                : '0x0000000000000000000000000000000000000000'}
            </span>
            <p className='mt-3'>
              <strong>Nonce:</strong>
              <br />
              {showSignatures && nonce}
            </p>
          </div>

          <div className='w-full flex gap-[18px] mt-[20px] px-6'>
            <button
              onClick={() => {
                trackEvent('reject_button_clicked', {
                  button_name: 'Reject',
                  screen: 'Review',
                });
                setShowSignatures(false);
                setRejected(true);
              }}
              className='w-[100%] outline-none rounded-[10px] border-none h-[56px] bg-[#EBEBEE] text-[17px] font-[775] leading-[24px] text-[#181C1F]'
            >
              Reject
            </button>

            <button
              onClick={() => {
                trackEvent('accept_button_clicked', {
                  button_name: 'Accept',
                  screen: 'Minting',
                });
                router.push('/reviewSwap');
                setShowSignatures(false);
              }}
              className='w-[100%] outline-none rounded-[10px] border-none h-[56px] bg-[#181C1F] text-[17px] font-[775] leading-[24px] text-[#FFFFFF]'
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignatureRequest;
