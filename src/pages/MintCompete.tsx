// @ts-ignore
import React, { FC, useEffect, useRef } from 'react';
// @ts-ignore
import { Card, CardHeader, CardFooter, button } from '@nextui-org/react';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal/Modal';
import moment from 'moment-timezone';
import { getUserWhiteListStatusHelper } from './api/apiCalls';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, Dispatch } from '../store/index';
import { INft } from '@/types/interfaces';
import Script from 'next/script';
import withAuth from '@/hoc/withAuth';
import { ClipLoader } from 'react-spinners';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { shortenAddress } from '@/utils/common';
import Typography from '@/components/Typography/Typography';
import DownLoadKresus from '@/Modals/DownloadKresus/DownLoadKresus';
import ContestEntry from '@/Modals/ContestEntry/ContestEntry';
import { assets } from '@/assets';
import { useAmplitude } from '@/provider/Amplitude';
import { isUserAddedInGiveAway } from '@/http';
import { MiniKit } from '@worldcoin/minikit-js';
import { VerifyBlock } from '@/components/VerifyWithWLD/VerifyWithWLD';

const ImageLoader: FC<{ src: string }> = ({ src }) => {
  const [loading, setLoading] = useState(true);
  const handleOnLoad = () => {
    setLoading(false);
  };
  return (
    <div className='w-full h-full relative bg-[#01032C]'>
      {loading && (
        <div className='w-full h-full absolute top-0 left-0 flex items-center justify-center'>
          <ClipLoader color='#0734A9' loading={loading} size={50} />
        </div>
      )}
      <img
        src={src}
        className={classNames('w-full h-full', loading && 'hidden')}
        onLoad={(e: any) => handleOnLoad()}
        alt=''
      />
    </div>
  );
};

export const MintComplete = () => {
  const dispatch = useDispatch<Dispatch>();
  const { trackEvent } = useAmplitude();

  const [index, setIndex] = useState(0);
  const router = useRouter();
  const [vaultAddress, setVaultAddress] = useState('');
  const [fLoading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState('shareWithFriends');
  const [selectedImage, setSelectedImage] = useState('');
  const [sharedList, setSharedList] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [showGiveAway, setShowGiveAway] = useState(false);

  const scrollDiv = useRef<HTMLDivElement>(null);

  const { vault_address, user, wldWallet_address } = useSelector(
    (state: RootState) => state.auth
  );
  const { nftImages, nfts, selectedNft, emailSharedList, tokenType, loading } =
    useSelector((state: RootState) => state.nft);
  const { showContestModal } = useSelector((state: RootState) => state.utils);

  const handleCheckGiveAwayStatus = async () => {
    try {
      const address = MiniKit.walletAddress;
      if (address) {
        const { data } = await isUserAddedInGiveAway(address);
        setShowGiveAway(data.userGiveAwayStatus);
      }
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleCopy = () => {
    toast(
      <div className='w-full h-[60px] p-4 bg-[#ADD2FD] rounded-[10px] flex items-center gap-[10px]'>
        <div className=''>
          <Image src='/tick.svg' width={14} height={9.5} alt='' />
        </div>
        <div>
          <p className='text-[15px] leading-[19px] text-[#01032C] font-[775]'>
            Contract Address Copied
          </p>
        </div>
      </div>,
      {
        position: 'bottom-right',
        className: 'bg-red-500',
        closeButton: false,
        progressStyle: {
          visibility: 'hidden',
        },
        autoClose: 4000,
      }
    );

    navigator.clipboard.writeText(process.env.NEXT_PUBLIC_NFT_CONTRACT_HASH!);
  };

  const handleFetchNfts = async () => {
    try {
      dispatch.nft.handleGetNfts(vault_address);
    } catch (err: any) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClickMint = () => {
    if (nfts?.length >= 25) {
      toast(
        <div className='w-full h-[60px] p-4 bg-[#ADD2FD] rounded-[10px] flex items-center gap-[10px]'>
          <div className=''>
            <Image src='/warning.svg' width={17} height={17} alt='' />
          </div>
          <div>
            <p className='text-[15px] leading-[19px] text-[#01032C] font-[775]'>
              Maximum NFT badges minted
            </p>
            <p className='text-[13px] font-[500] text-[#01032C] leading-[17px]'>
              You can mint up to 25 NFT Badges.
            </p>
          </div>
        </div>,
        {
          position: 'bottom-right',
          className: 'bg-red-500',
          closeButton: false,
          progressStyle: {
            visibility: 'hidden',
          },
          autoClose: 4000,
        }
      );
      trackEvent('mint_another_option_clicked', {
        nft_creation_started: false,
      });
    } else {
      trackEvent('mint_another_option_clicked', {
        nft_creation_started: true,
      });
      router.push('/uploadImage');
    }
  };

  useEffect(() => {
    setVaultAddress(vault_address);
  }, [vault_address]);

  const formatDateWithTimezone = (dateString: string) => {
    const timeZone = moment.tz.guess();
    const abbrevation = moment.tz(timeZone).format('z');
    const date = moment(dateString).local(); // EST timezone
    return `${date.format('MMM DD, YYYY @ hh:mm:ss.SS')} ${abbrevation}`;
  };

  const handleGetSharedEmailList = async (tokenId: any) => {
    try {
      let address = vaultAddress;
      dispatch.nft.handleGetEmailSharedList({ address, tokenId });
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleScreen = async () => {
    const { whiteListedStatus, subscriptionStatus } =
      await getUserWhiteListStatusHelper();
    setClaimed(subscriptionStatus);
    if (emailSharedList?.length === 0) {
      setScreen('shareWithFriends');
    } else if (emailSharedList?.length > 0 && emailSharedList?.length < 3) {
      setScreen('successfullyCreation');
      if (whiteListedStatus) {
        setScreen('successfullyShared');
      }
    } else if (emailSharedList?.length >= 3) {
      setScreen('successfullyShared');
      if (whiteListedStatus) {
        setScreen('successfullyShared');
      }
    } else {
      setScreen('shareWithFriends');
    }
    dispatch.nft.setWhiteListed(whiteListedStatus);
  };

  useEffect(() => {
    if (selectedNft) {
      dispatch.nft.setEmailSharedList([]);
      const tokenId = selectedNft.tokenId;
      // localStorage.setItem('nft-Id', tokenId);
      handleGetSharedEmailList(tokenId);
    }
    if (scrollDiv.current) {
      scrollDiv.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [selectedNft]);

  useEffect(() => {
    handleScreen();
  }, [emailSharedList]);

  useEffect(() => {
    dispatch.nft.reset();
  }, []);

  useEffect(() => {
    if (wldWallet_address) {
      handleCheckGiveAwayStatus();
    }
  }, [wldWallet_address]);

  useEffect(() => {
    if (!user) {
      dispatch.auth.handleGetUser();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      dispatch.nft.handleGetNfts(vault_address);
    }
  }, [user]);

  useEffect(() => {
    if (nfts?.length) {
      trackEvent('recent_nft_selected', {
        nft_id: `Marble #${nfts[0].tokenId}`,
        selected: true,
      });
    }
  }, [nfts]);

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
      <div className='h-[100dvh]'>
        {!wldWallet_address && <VerifyBlock walletOnly />}
        <div className='flex flex-col items-center justify-between align-middle min-h-[100dvh] bg-[#01032C] bg-gradient_img bg-cover '>
          <div className='flex items-center justify-center w-full h-[65px] px-3'>
            <Typography variant='lg'>My NFTs</Typography>
          </div>
          <div className='flex-grow w-full h-0 overflow-auto ' ref={scrollDiv}>
            {selectedNft && (
              <Card className='rounded-md m-[15px] p-0 mt-0 mb-[0px] z-0 '>
                {/* {showGiveAway && (
                  <div className='rounded-t-[20px] border border-[#ffffff4d] pb-10 mb-[-20px] flex items-center justify-between pt-[17px] px-5'>
                    <div className='flex items-center gap-[15px]'>
                      <Image src={assets.tick} alt='' />
                      <Typography weight='semibold'>
                        NFT Entered to Win
                      </Typography>
                    </div>
                    <a
                      href='https://kresus.com/kresus-nft-mint-to-win-sweepstakes-official-rules/'
                      rel='noreferrer'
                      target='_blank'
                    >
                      <Typography
                        variant='sm'
                        weight='medium'
                        className='underline'
                      >
                        Rules
                      </Typography>
                    </a>
                  </div>
                )} */}

                <CardHeader className='flex flex-col p-0'>
                  <div
                    style={{ borderRadius: '20px 20px 0px 0px' }}
                    className='w-full aspect-square bg-gray-200 overflow-hidden'
                  >
                    <div className='relative w-full h-full rounded-t-md overflow-hidden flex items-center justify-center flex-col cursor-pointer gap-4'>
                      {/* <canvas hidden id="canvas" width="500" height="500"></canvas> */}
                      {selectedNft && (
                        <>
                          <ImageLoader src={selectedNft.image.originalUrl} />
                        </>
                      )}
                    </div>
                  </div>
                  <div
                    style={{ borderRadius: '0px 0px 20px 20px' }}
                    className='bg-[#01032c] p-[15px] flex justify-between w-[100%]'
                  >
                    <div className='flex flex-col gap-1'>
                      <span className='text-[#FFFFFF] text-[19px] font-[500] leading-[24px]'>
                        {selectedNft &&
                          `${selectedNft.name}  #${selectedNft.tokenId}`}
                      </span>
                      <span className='text-[#ADD2FD] text-[15px] leading-[19px] font-[500]'>
                        Access perks on Kresus
                      </span>
                    </div>
                    <div className='flex items-center justify-center'>
                      <span
                        className='border-[#4898F3] border-[1px] pl-[18px] rounded-[99px] pr-[18px] pt-[10px] pb-[10px]'
                        onClick={() => {
                          setShowModal(true);
                          trackEvent('download_button_clicked', {
                            button_name: 'Download',
                            nft_id: `Marble #${selectedNft?.tokenId}`,
                          });
                          // const os = getMobileOS();
                          // if (os === 'iOS') {
                          //   window.location.href =
                          //     'https://apps.apple.com/us/app/kresus-base-wallet/id6444355152';
                          // } else {
                          //   window.location.href =
                          //     'https://play.google.com/store/apps/details?id=com.kresus.superapp&hl=en';
                          // }
                        }}
                        // onClick={async () => {
                        //   if (selectedNft) {
                        //     const file = await GetFile(
                        //       selectedNft?.image?.originalUrl
                        //     );

                        //     const link = document.createElement('a');
                        //     link.href = URL.createObjectURL(file);
                        //     link.download = file.name;
                        //     document.body.appendChild(link);
                        //     link.click();
                        //     document.body.removeChild(link);
                        //   }
                        // }}
                      >
                        Download
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <a
                  href='https://worldcoin.org/mini-app?app_id=app_b0d01dd8f2bdfbff06c9e123de487eb8'
                  rel='noreferrer'
                  target='_blank'
                >
                  <div className='rounded-b-[20px] h-[76px] border border-[#ffffff4d] pb-5 mt-[-20px] flex items-center justify-between pt-[37px] px-5'>
                    <div className='flex items-center gap-[15px] '>
                      <Image src={assets.world_app} alt='' />
                      <Typography weight='semibold'>
                        Start earning 50%+ on your $WLD
                      </Typography>
                    </div>

                    <Image src={assets.chevron_right} alt='' />
                  </div>
                </a>
              </Card>
            )}
            <div className='flex flex-col gap-4 scroll-container mt-8 px-[15px] pb-8'>
              <span className='text-[#FFFFFF] text-[15px] leading-[19px] font-[660] '>
                My NFTs on Kresus
              </span>
              {loading || fLoading ? (
                <div className='flex items-center justify-center py-10'>
                  <ClipLoader color='#ffffff' size={40} />
                </div>
              ) : (
                <div className='grid grid-cols-3 gap-2 '>
                  {nfts?.map((nft: INft, mIndex: number) => (
                    <div
                      key={mIndex}
                      onClick={() => {
                        dispatch.nft.setSelectedNft(nft);
                        setIndex(mIndex);
                      }}
                      className={classNames(
                        'w-full h-full bg-gray-200  rounded-[10px] overflow-hidden  aspect-square relative',
                        selectedNft?.tokenId === nft?.tokenId &&
                          nfts?.length > 1 &&
                          'border-[4px] border-[#4898F3] shadow-sm'
                      )}
                    >
                      <ImageLoader src={nft.image.originalUrl} />
                    </div>
                  ))}

                  <div
                    className={classNames(
                      'aspect-square bg-[#FFFFFF0A] border border-[#FFFFFF33] rounded-[10px] flex flex-col items-center justify-between py-[15px] px-2 cursor-pointer',
                      nfts?.length >= 25 && 'opacity-40'
                    )}
                    onClick={handleClickMint}
                  >
                    <p className='font-medium text-transparent font-[MessinaSans] text-[13px] leading-[17px]'>
                      Mint Another
                    </p>
                    <Image src='plus.svg' width={20} height={20} alt='' />
                    <p className='font-medium text-white font-[MessinaSans] text-[13px] leading-[17px]'>
                      Mint Another
                    </p>
                  </div>
                  {/* <Image
                  onClick={() => router.push('/uploadImage')}
                  className='cursor-pointer'
                  src={assets.anotherMint}
                  alt=''
                /> */}
                </div>
              )}
            </div>
            <Card
              style={{
                borderTop: '1px solid #283f52',
                fontSize: 13,
                marginTop: '32px',
                color: '#fff',
                margin: '0px 20px',
                paddingBottom: '32px',
              }}
            >
              <CardFooter
                className='flex flex-col gap-4'
                style={{ marginTop: 10, paddingInline: 0 }}
              >
                <div className='flex justify-between w-full'>
                  <span className='text-[#FFFFFFA8] text-[13px] leading-[17px] '>
                    Blockchain
                  </span>
                  <span className='text-right text-[15px] font-[500] leading-[15px]'>
                    WORLDCHAIN
                  </span>
                </div>
                <div className='flex justify-between w-full'>
                  <span className='text-[#FFFFFFA8] text-[13px] leading-[17px] '>
                    Contract Address
                  </span>
                  <div className='flex gap-1'>
                    <span className='text-[15px] font-[500] leading-[15px]'>
                      {shortenAddress(
                        process.env.NEXT_PUBLIC_NFT_CONTRACT_HASH!,
                        4,
                        4
                      )}
                    </span>
                    <Image
                      className='cursor-pointer'
                      width={14}
                      height={14}
                      src={'/copy.svg'}
                      onClick={handleCopy}
                      alt=''
                    />
                  </div>
                </div>
                <div className='flex justify-between w-full'>
                  <span className='text-[#FFFFFFA8] text-[13px] leading-[17px] '>
                    Token Standard
                  </span>
                  <span className='text-right text-[15px] font-[500] leading-[15px]'>
                    {tokenType}
                  </span>
                </div>
                <div className='flex justify-between w-full'>
                  <span className='text-[#FFFFFFA8] text-[13px] leading-[17px] '>
                    Minted
                  </span>
                  <span className='text-right text-[15px] font-[MessinaSans] font-[500] leading-[15px]'>
                    {nfts?.length > 0 &&
                      formatDateWithTimezone(nfts[index].timeLastUpdated)}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className='w-[100%] bg-red-400'>
            <div className='main-card bg-[#030A74] pl-[20px] pr-[20px] pt-[15px] pb-[15px] flex gap-4 flex-col justify-center border-t-[1px] border-t-[#030A74] relative'>
              <div className='absolute left-0 top-0 bg-[#01032CCC] w-full h-full'>
                {' '}
              </div>
              <div className='flex flex-col gap-3 z-10'>
                <button
                  onClick={() => {
                    if (localStorage.getItem('selectedImage')) {
                      localStorage.removeItem('selectedImage');
                    }
                    localStorage.setItem('selectedImage', nftImages[index]);
                    trackEvent('share_with_friends_button_clicked', {
                      nft_id: `Marble #${selectedNft?.tokenId}`,
                      action_taken: 'Share with Friends',
                    });
                    // setScreen("shareWithFriends");
                    setOpen(true);
                    setSelectedImage(nftImages[index]);
                    // router.push("/shareWithFriends");
                  }}
                  style={{ width: '100%' }}
                  className='access-my-photos'
                >
                  Share with Friends
                </button>
                <button
                  onClick={() => {
                    trackEvent('view_in_kresus_app_button_clicked', {
                      nft_id: `Marble #${selectedNft?.tokenId}`,
                      action_taken: 'View in Kresus App',
                    });
                    setShowModal(true);
                  }}
                  className='view-app !h-[50px]'
                >
                  View in Kresus App
                </button>
              </div>
            </div>
          </div>
        </div>
        {showModal && (
          <DownLoadKresus
            open={showModal}
            setOpen={setShowModal}
            selectedNft={selectedNft}
          />
        )}
         {/* Remove prize change 5 */}
        {/* {showContestModal && <ContestEntry />} */}
      </div>
      <Modal
        open={open}
        handleClose={setOpen}
        setScreen={setScreen}
        screen={screen}
        selectedImage={selectedImage}
        sharedEmailList={sharedList}
        setSharedEmailList={setSharedList}
        claimed={claimed}
      />
    </>
  );
};

export default withAuth(MintComplete);
