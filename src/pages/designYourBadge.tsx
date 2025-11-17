import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, Divider } from '@nextui-org/react';
import { assets } from '@/assets';
import { getJWTToken } from '@/components/AppLocalStorage/AppLocalStorage';
// import { MiniKit, RequestPermissionPayload, Permission } from '@worldcoin/minikit-js'
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '@/store';
import { ClipLoader } from 'react-spinners';
import withAuth from '@/hoc/withAuth';
import Typography from '@/components/Typography/Typography';
import { useAmplitude } from '@/provider/Amplitude';
import classNames from 'classnames';

const designYourBadge = () => {
  const router = useRouter();
  const dispatch = useDispatch<Dispatch>();

  const token = getJWTToken();
  const { trackEvent } = useAmplitude();

//   const requestPermission = useCallback(
//     async () => {
//         const requestPermissionPayload: RequestPermissionPayload = {
//             permission: Permission.Notifications,
//         };
//         const payload = await MiniKit.commandsAsync.requestPermission(requestPermissionPayload);
//         console.log("payload----->",payload)
//         // Handle the response
//     },
//     []
// );

  const { loading, nfts } = useSelector((state: RootState) => state.nft);
  const { loading: userLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const handleViewMyNFTs = () => {
    router.push('/MintCompete');
  };

  useEffect(() => {
    if (token) {
      dispatch.auth.handleGetUser();
    }
  }, []);

  // useEffect(()=>{
  //   requestPermission()
  // },[])

  return (
    <div className='h-[100dvh] flex flex-col'>
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
          <div
            className={classNames(
              'relative',
              nfts?.length > 0 ? 'h-[160px]' : 'h-[110px]'
            )}
          >
            <Image src='/waves.png' fill alt='' />
          </div>
        </div>
      </div>
      <div className=' absolute w-full flex flex-col  items-center justify-between align-middle min-h-[100dvh] z-20'>
        <div className='text-animation w-[100%] flex flex-grow px-6  items-center flex-col h-0 overflow-auto pt-6'>
          <Image src={assets.logo} width={42.5} height={50} alt='Kresus logo' />
          <Typography
            variant='2xl'
            className='text-[30px] font-[460] leading-[38px] text-center mt-[15px]'
            family='beirut'
          >
            Design Your <br /> Exclusive NFT Badge
          </Typography>
          <div className='w-[100%] mt-[20px]'>
            <Image className='w-[100%]' src={assets.nfts} alt='card' />
          </div>
          <Card className='border pl-[18px] pr-[18px] border-[#086DE1] rounded-[18px]  text-[13px] mt-[22px] shrink-0'>
            <CardHeader>
              <div className='flex flex-row gap-[18px] pb-[1px]'>
                <Typography
                  variant='sm'
                  color='soft-blue'
                  weight='semibold'
                  className='whitespace-nowrap'
                >
                  STEP 1
                </Typography>
                <Typography>Select your favorite photo</Typography>
              </div>
            </CardHeader>
            <Divider style={{ borderBottom: '0.5px solid #086DE1' }} />
            <CardHeader>
              <div className='flex flex-row gap-[18px]  pb-[1px]'>
                <Typography
                  variant='sm'
                  color='soft-blue'
                  weight='semibold'
                  className='whitespace-nowrap'
                >
                  STEP 2
                </Typography>
                <Typography>Customize and mint your NFT</Typography>
              </div>
            </CardHeader>
            <Divider style={{ borderBottom: '0.5px solid #086DE1' }} />
            <CardHeader className=''>
              <div className='flex flex-row gap-[18px] pb-[1px]'>
                <Typography
                  variant='sm'
                  color='soft-blue'
                  weight='semibold'
                  className='whitespace-nowrap'
                >
                  STEP 3
                </Typography>
                <Typography>
                  {/* Enter weekly for a chance to win your share of $500 of WLD */}
                   {/* Remove prize change 2 */}
                   Mint it, share it, and unlock perks and rewards.
                </Typography>
              </div>
            </CardHeader>
          </Card>
          <div className='pt-5'></div>
        </div>
        <div
          className={classNames(
            'w-[100%]  mt-auto pt-[15px] px-[25px]',
            nfts?.length > 0 ? 'h-[160px]' : 'h-[110px]'
          )}
        >
          {/* <button
            onClick={() => router.push('/uploadImage')}
            className='rounded-full text-[19px]  font-[MessinaSans] button-background font-[660]'
            style={{
              minHeight: 55,
              width: '100%',
            }}
          >
            Begin Minting
          </button> */}
          <button
            onClick={() => {
              router.push('/uploadImage');

              trackEvent('begin_minting_triggered', {
                button: 'Begin Minting',
                screen: 'Select Photo',
              });
            }}
            className='access-my-photos font-bold !mb-6 h-[55px] disabled:bg-[#0734A9] disabled:text-[#01032C] max-w-[100vw] w-full flex items-center justify-center'
            disabled={userLoading || loading}
          >
            {userLoading || loading ? (
              <ClipLoader size={20} color='#fff' />
            ) : (
              'Begin Minting'
            )}
          </button>
          {nfts?.length > 0 && (
            <button
              onClick={handleViewMyNFTs}
              className='view-app w-full !h-[50px]'
            >
              View My NFTs
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(designYourBadge);
