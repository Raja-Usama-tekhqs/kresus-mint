// @ts-ignore
import React, { useEffect, useRef } from 'react';
// @ts-ignore
import { Card, CardHeader, CardFooter, Divider } from '@nextui-org/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  setIPFSHASH,
  getVaultAddress,
  setTxCost,
  setNonce,
} from '@/components/AppLocalStorage/AppLocalStorage';
import Image from 'next/image';
import { assets } from '@/assets';
import Draggable from 'react-draggable';
import SignatureRequest from '@/components/SignatureRequest/SignatureRequest';
import pinFileToIPFS from '../uploadNFTToIPFS/uploadNFTToIPFS';
import { gasPriceHelper, convertEthIntoUSDHelper } from './api/apiCalls';

import { RootState, Dispatch } from '@/store';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import Checkbox from '@/components/Checkbox/Checkbox';
import withAuth from '@/hoc/withAuth';
import Typography from '@/components/Typography/Typography';
import { useAmplitude } from '@/provider/Amplitude';
import { MiniKit } from '@worldcoin/minikit-js';
import { VerifyBlock } from '@/components/VerifyWithWLD/VerifyWithWLD';

export const verifyWithWorldIdToMintNFT = () => {
  // const [image, setImage] = useState<string | null>(null);

  const dispatch = useDispatch<Dispatch>();
  const { trackEvent } = useAmplitude();
  const router = useRouter();
  const {
    finalImage: image,
    uploadedImage,
    addToGiveAway,
  } = useSelector((state: RootState) => state.nft);
  const { wldWallet_address } = useSelector((state: RootState) => state.auth);
  const parentRef = useRef<HTMLDivElement>(null);
  const [isTextVisible, setIsTextVisible] = useState(true);
  const [showSignatures, setShowSignatures] = useState(false);
  const [defaultDraggable, setDefaultDraggable] = useState({ x: 2, y: 0 });
  const [gasPrice, setGasPrice] = useState<string | null>(null);
  const [usd, setUSD] = useState<string | null>(null);
  const [nonceValue, setNonceValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasRejected, sethasRejected] = useState(false);

  const [error, setError] = useState('');

  const handleUploadToIPFS = async () => {
    try {
      setLoading(true);
      trackEvent('transaction_fee_calculation_started', {
        calculation_status: 'started',
      });
      const IPFSMetaDataHash = await pinFileToIPFS(image);
      setIPFSHASH(IPFSMetaDataHash!);
      if (IPFSMetaDataHash) {
        dispatch.nft.setIpfsHash(IPFSMetaDataHash);
      }

      const gasPriceResult = await gasPriceHelper(
        getVaultAddress(),
        IPFSMetaDataHash
      );
      const convertEthIntoUSDResult = await convertEthIntoUSDHelper(
        'ETH',
        'USD',
        gasPriceResult.txCostInEther
      );

      setGasPrice(gasPriceResult.txCostInEther);
      setUSD(convertEthIntoUSDResult);
      setTxCost(convertEthIntoUSDResult!);
      setNonce(gasPriceResult.nonce);
      setNonceValue(gasPriceResult.nonce);
      trackEvent('transaction_fee_calculated', {
        transaction_fee_eth: gasPriceResult.txCostInEther,
        transaction_fee_usd: convertEthIntoUSDResult,
      });
      dispatch.nft.setTxCost(convertEthIntoUSDResult!);
      trackEvent('loading_hidden', {
        loading_status: false,
      });
    } catch (err: any) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  // const onSignMessage = () => {
  //   const signMessagePayload: SignMessageInput = {
  //     message:
  //       'Thank you for minting an NFT with Kresus!. Click to sign and accept the Kresus Terms of Service and Privacy Policy when you choose to mint your NFT.',
  //   };

  //   MiniKit.commands.signMessage(signMessagePayload);
  // };

  useEffect(() => {
    if (image && uploadedImage) {
      setTimeout(async () => handleUploadToIPFS(), 500);
    } else {
      router.replace('/uploadImage');
    }
  }, [image]);

  const handleStop = (e: any, data: any) => {
    const { x } = data;
    const parentWidth = parentRef?.current?.offsetWidth;
    const draggableWidth = 100;

    const rightEdge = parentWidth! - draggableWidth;
    const atRightEdge = x >= rightEdge;

    if (atRightEdge) {
      // console.log("Reached right edge!");

      setShowSignatures(true);
      if (!MiniKit.walletAddress) {
        dispatch.nft.setAddToGiveAway(false);
      }
      setDefaultDraggable({ x: 0, y: 0 });
      setIsTextVisible(true);
      trackEvent('signature_request_screen_open');
      trackEvent('accept_button_present', {
        button_name: 'Accept',
      });
    } else {
      setDefaultDraggable({ x: 0, y: 0 });
      setIsTextVisible(true);
    }
  };

  const handleDrag = (e: any, data: any) => {
    const parentWidth = parentRef?.current?.offsetWidth;
    const center = parentWidth! / 2;

    // Check if the draggable element's x position has reached or passed the center
    const atCenter = data.x >= center - 50; // Adjust 50 if necessary based on draggable element's size

    setIsTextVisible(!atCenter);
    setDefaultDraggable({ x: data.x, y: data.y });
    if (atCenter) {
      trackEvent('swipe_to_mint_text_remove_animation', {
        text: 'Swipe to Mint',
        animation: 'removing with swipe',
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    trackEvent('checkbox_present', {
      checkbox_name:
        'By entering, I consent to the terms and conditions in the rules.',
    });
  }, []);

  useEffect(() => {
    if (showSignatures) {
      trackEvent('reject_button_present', {
        button_name: 'Reject',
      });
    }
  }, [showSignatures]);

  // useEffect(() => {
  //   let inerval: any = null;
  //   if (!installed) {
  //     inerval = setInterval(() => {
  //       if (MiniKit.isInstalled()) {
  //         setInstalled(true);
  //         clearInterval(inerval);
  //       }
  //     }, 500);
  //   }
  //   return () => {
  //     clearInterval(inerval);
  //   };
  // }, [installed]);

  // useEffect(() => {
  //   if (!MiniKit.isInstalled()) {
  //     return;
  //   }

  //   MiniKit.subscribe(ResponseEvent.MiniAppSignMessage, async payload => {
  //     if (payload.status === 'success') {
  //       setSigned(true);
  //       setShowSignatures(true);
  //       if (!MiniKit.walletAddress) {
  //         dispatch.nft.setAddToGiveAway(false);
  //       }
  //       setDefaultDraggable({ x: 0, y: 0 });
  //       setIsTextVisible(true);
  //     }
  //     if (payload.status === 'error') {
  //       setHasRejectedSign(prev => !prev);
  //     }
  //     setDefaultDraggable({ x: 0, y: 0 });
  //     setIsTextVisible(true);
  //   });

  //   return () => {
  //     MiniKit.unsubscribe(ResponseEvent.MiniAppSignMessage);
  //   };
  // }, [MiniKit, installed]);

  return (
    <div className='h-[100dvh]'>
      <div className='flex flex-col items-center justify-between align-middle min-h-[100dvh] bg-[#01032C]  bg-gradient_img bg-cover'>
        <div className='flex items-center justify-between w-full min-h-[65px] px-3'>
          <Image
            src={assets.back}
            width={35}
            height={35}
            className='cursor-pointer'
            alt='chevron-left'
            onClick={handleBack}
          />
          <Typography variant='lg'>Review</Typography>
          <div className='w-[35px]' />
        </div>
        {!wldWallet_address && <VerifyBlock walletOnly />}
        <div className='flex-grow h-0 overflow-auto flex flex-col'>
          <Card
            className='rounded-md shrink-0'
            style={{
              width: '100%',
              borderRadius: 20,
              paddingBottom: '5px',
              padding: '15px',
              paddingTop: '0px',
            }}
          >
            <CardHeader>
              <div className='w-full rounded-[20px] overflow-hidden aspect-square bg-gray-200'>
                <div className='relative w-full h-full rounded-md overflow-hidden flex items-center justify-center flex-col cursor-pointer gap-4'>
                  {/* <canvas hidden id="canvas" width="500" height="500"></canvas> */}
                  {image && (
                    <>
                      <img src={image} className='w-full h-full' alt='' />
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <Divider />
            <CardFooter style={{ color: '#fff' }} className='mt-[15px] py-0'>
              <div className='flex flex-col'>
                {/* <span className='text-[#abb9bc] text-[15px] font-[MessinaSans] font-[500] leading-[19px] '>
                  Mint your Worldcoin styled collectible and share it with your
                  friends and family.
                </span> */}
              </div>
            </CardFooter>
          </Card>

          <div className='w-[100%] mt-auto '>
             {/* Remove prize change 3 */}
            {/* {wldWallet_address && (
              <div className='flex items-center gap-3 mt-5 pb-5 px-[15px]'>
                <Checkbox
                  selected={addToGiveAway}
                  onChange={e => {
                    dispatch.nft.setAddToGiveAway(e);
                    setError('');
                  }}
                  error={!!error}
                />

                <div className='flex-grow'>
                  <Typography color={error ? 'error' : 'white'} weight='medium'>
                    By entering, I consent to the terms and conditions in the{' '}
                    <a
                      href='https://kresus.com/kresus-nft-mint-to-win-sweepstakes-official-rules/'
                      rel='noreferrer'
                      target='_blank'
                    >
                      <span className='underline'>rules</span>
                    </a>
                    .
                  </Typography>
                </div>
              </div>
            )} */}
            <Card
              style={{
                borderTop: '1px solid #283f52',
                fontSize: 13,
                marginTop: 10,
                color: '#fff',
                paddingBottom: '30px',
                margin: '0px 15px',
              }}
            >
              <CardFooter style={{ paddingInline: 0, marginTop: 10 }}>
                <div className='flex justify-between w-full'>
                  <div className='flex flex-row'>
                    <span>Transaction Fee</span>
                  </div>
                  <div className='flex flex-col text-right'>
                    <span>
                      {loading ? (
                        <div className='mini-loader'></div>
                      ) : gasPrice ? (
                        Number(gasPrice).toFixed(6) + ' ETH'
                      ) : (
                        ' ... '
                      )}
                    </span>
                    <span>
                      {loading ? (
                        <div className='mini-loader'></div>
                      ) : usd ? (
                        '$' + Number(usd).toFixed(2) + ' USD'
                      ) : (
                        ' ... '
                      )}
                    </span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
        <div className='w-[100%] overflow-hidden bg-[#01032CCC] pl-[20px] pr-[20px] pt-[15px] pb-[15px] flex h-[114px] gap-4 flex-col justify-center border-t-[1px] border-t-[#030A74]'>
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
            }}
            ref={parentRef}
            className={classNames(
              'bg-[#01021D] w-[100%] h-[59px] rounded-[99px]',
              'border-b border-b-[#10178A]'
            )}
          >
            {isTextVisible && (
              <div
                style={{
                  position: 'absolute',
                  left: '0px',
                  top: '0px',
                  transform: 'translate(100%, 58%)',
                }}
                className={classNames(
                  'text-center text-[19px] font-[500] leading-[24px]',
                  (loading || !wldWallet_address) && 'text-[#0734A9]'
                )}
              >
                Swipe to Mint
              </div>
            )}

            <Draggable
              axis='x'
              handle='.handle'
              position={defaultDraggable}
              scale={1}
              bounds={'parent'}
              onStop={handleStop}
              onDrag={handleDrag}
              disabled={loading || !wldWallet_address}
            >
              <div
                className={classNames(
                  'handle h-[55px] w-[55px] rounded-full border-2 grid place-items-center',
                  loading || !wldWallet_address
                    ? 'bg-btn_gradient border-[#0734A9]'
                    : 'bg-btn_gradient2 border-[#FFFFFF]'
                )}
              >
                <Image
                  className='cursor-pointer'
                  src={assets.arrow_right}
                  alt=''
                />
              </div>
            </Draggable>
          </div>
        </div>
      </div>

      {showSignatures && (
        <SignatureRequest
          setRejected={sethasRejected}
          setShowSignatures={setShowSignatures}
          showSignatures={showSignatures}
          nonce={nonceValue}
          price={gasPrice}
        />
      )}
    </div>
  );
};

export default withAuth(verifyWithWorldIdToMintNFT);
