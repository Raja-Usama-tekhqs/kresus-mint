import TextField from '@/components/AppTextBox/AppTextBox';
import Image from 'next/image';
import { assets } from '@/assets';
import { useEffect, useState } from 'react';
import { Divider } from '@nextui-org/react';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, Dispatch } from '../store/index';
import { isValidEmail } from '@/utils/common';
import {
  handleMintSubscription,
  shareYourCreationHelper,
} from './api/apiCalls';
import { getMobileOS } from '@/components/GetFile/GetFile';
import { useAmplitude } from '@/provider/Amplitude';

export default function SuccessfullyShared({ setScreen, list, claimed }: any) {
  const dispatch = useDispatch<Dispatch>();
  const { trackEvent } = useAmplitude();
  const [email, setEmail] = useState('');
  const [emailList, setEmailList] = useState<string[]>([]);

  const { selectedNft, emailSharedList } = useSelector(
    (state: RootState) => state.nft
  );
  const { vault_address } = useSelector((state: RootState) => state.auth);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const userEmail = localStorage.getItem("Email")
  const [submitLoading, setSubmitLoading] = useState(false);

  const [rewardClaimed, setRewardClaimed] = useState(false);

  const handleClaimReward = async () => {
    try {
      trackEvent('claim_rewards_button_clicked', {
        button_name: 'Claim $9.99 Reward',
      });
      setLoading(true);
      await handleMintSubscription();
      setRewardClaimed(true);
    } catch (err: any) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  async function shareNFTToFriends() {
    const trimmedEmail = email.trim().toLowerCase();
    const normalizedUserEmail = userEmail?.trim().toLowerCase();
    if (trimmedEmail && normalizedUserEmail && trimmedEmail === normalizedUserEmail) {
      setError("You can't share NFT to your own email address.");
      return;
    }
    if (Array.isArray(emailSharedList) && emailSharedList?.includes(trimmedEmail)) {
      setError("You've already shared this NFT with this user.");
      return;
    }
    const list = [...emailList];
    if (email) {
      if (
        isValidEmail(email) &&
        !list.includes(email) &&
        !emailSharedList.includes(email)
      ) {
        list.push(email);
        setEmailList(list);
      } else {
        trackEvent('email_invalid', {
          email: email,
          email_format_valid: false,
        });
        return setError('Invalid Email');
      }
    }

    if (emailSharedList.length >= 1 && selectedNft) {
      setSubmitLoading(true);
      try {
        const ipfsHash = selectedNft.tokenUri.split('/').at(-1);
        trackEvent('send_button_clicked', {
          button_name: 'Send',
          emails: list,
        });

        await shareYourCreationHelper(
          list,
          vault_address,
          selectedNft?.tokenId,
          selectedNft?.name,
          selectedNft?.description,
          selectedNft?.image.originalUrl,
          ipfsHash
        );

        trackEvent('nft_shared', {
          emails: list,
          nft_id: `Marble #${selectedNft.tokenId}`,
        });

        setEmail('');
        setEmailList([]);
        dispatch.nft.handleGetEmailSharedList({
          address: vault_address,
          tokenId: selectedNft?.tokenId,
        });
      } catch (error) {
        console.error('Error sharing NFT:', error);
      } finally {
        setSubmitLoading(false);
      }
    }
  }


  useEffect(() => {
    if (selectedNft) {
      setImage(selectedNft.image.originalUrl);
    }
  }, [selectedNft]);

  useEffect(() => {
    setRewardClaimed(claimed);
  }, [claimed]);

  return (
    <div
      style={{
        borderRadius: '20px',
        border: '1px solid transparent',
      }}
      className='bg-[#01032CCC] h-full'
    >
      <div className='flex flex-col pl-[20px] pr-[20px] items-center  pt-6 pb-[2.5rem] align-middle h-full '>
        <div className='flex flex-col items-center '>
          {image && (
            <div className='rounded-md overflow-hidden bg-gray-200'>
              <Image src={image} width={65} height={65} alt='Kresus logo' />
            </div>
          )}
          <span className=' font-[460] mt-3 text-[24px] font-[Beirut] text-center text-[#fff]'>
            You’ve successfully shared your creation!
          </span>
          <span className='mt-[30px] text-[15px] leading-[19px] font-[500] text-[#fff]'>
            Share with more friends:
          </span>
          <div className='mt-3 w-full'>
            <TextField
              label={
                emailList.length === 0
                  ? "Enter Friend's Email"
                  : 'Enter Another Email'
              }
              showButton
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setError('');
              }}
              disabled={(emailSharedList?.length + emailList?.length === 3) || submitLoading}
              onKeyUp={e => {
                var code = e.keyCode ? e.keyCode : e.which;
                if (code == 13 && email.trim()) {
                  if (
                    isValidEmail(email) &&
                    !emailList.includes(email) &&
                    !list.includes(email)
                  ) {
                    const newEmailList = [];
                    newEmailList.push(email);
                    setEmailList([...emailList, ...newEmailList]);
                    setEmail('');
                    trackEvent('email_added_to_list', {
                      email: email,
                    });
                  } else {
                    trackEvent('email_invalid', {
                      email: email,
                      email_format_valid: false,
                    });
                    setError('Invalid Email');
                  }
                }
              }}
              error={error}
              onClear={() => {
                if (submitLoading) return;
                trackEvent('email_removed', {
                  email: email,
                });
                setEmail('');
                setError('');
              }}
            />
          </div>
          {error && (
            <p className="text-red-600 text-left w-full mt-1 text-sm max-w-[488px]">
              {error}
            </p>
          )}
        </div>

        {/* <div className=""> */}

        {/* </div> */}

        <div
          style={{ scrollbarWidth: 'thin' }}
          className='mt-[20px] h-[30%] w-full max-w-[488px] flex gap-2 items-center flex-col overflow-auto'
        >
          {emailList.map((email, index) => (
            <div
              className='border-[1px] pt-[6px] w-fit pb-[6px] pl-[12px] pr-[12px] flex gap-[8px] align-middle justify-center rounded-[59.4px] border-[#4898F3]'
              key={index}
            >
              <span>{email}</span>
              <Image
                className='cursor-pointer'
                width={9.25}
                height={9.25}
                src={assets.closeIcon}
                onClick={() => {
                  if (!submitLoading) {
                    const newEmailList = emailList.filter(
                      (x, mIndex) => mIndex !== index
                    );
                    setEmailList(newEmailList);
                  }
                }}
                alt=''
              />
            </div>
          ))}
        </div>

        <div className='flex flex-col mt-auto gap-1 w-full max-w-[488px]'>
          <Divider style={{ borderTop: '1px solid #10178A' }} />
          <div className='flex gap-2 flex-col mt-[15px]'>
            <span className='text-[#ADD2FD] text-[15px] leading-[19px] font-[500]'>
              Collectible Shared With:
            </span>
            {emailSharedList?.map((email, index) => (
              <div key={index} className='flex gap-2 items-center'>
                <Image src={assets.sucess} alt='' />
                <span>{email}</span>
              </div>
            ))}
          </div>
          {emailList.length >= 1 || email ? (
            <button
              onClick={shareNFTToFriends}
              className='access-my-photos font-bold h-fit w-full mt-[20px] disabled:bg-[#0734A9] disabled:text-[#01032C]'
              style={{
                height: 55,
                width: '100%',
                color: '#181825',
              }}
              disabled={submitLoading || !(emailList.length >= 1 || email)}
            >
              Send
            </button>
          ) : (
            <>
              <button
                // onClick={() => setScreen('shareWithFriends')}
                className='access-my-photos font-bold h-fit w-full mt-[20px]  disabled:bg-[#0734A9] disabled:text-[#01032C]'
                style={{
                  height: 55,
                  width: '100%',
                  color: '#181825',
                }}
                onClick={handleClaimReward}
                disabled={rewardClaimed || loading}
              // onClick={() => {
              //   const os = getMobileOS();
              //   if (os === 'iOS') {
              //     window.location.href =
              //       'https://apps.apple.com/us/app/kresus-base-wallet/id6444355152';
              //   } else {
              //     window.location.href =
              //       'https://play.google.com/store/apps/details?id=com.kresus.superapp&hl=en';
              //   }
              // }}
              >
                {rewardClaimed ? 'Claimed' : 'Claim $9.99 Reward'}
              </button>
              {!rewardClaimed && (
                <span className='text-[#ADD2FD] font-[500] text-[15px] leading-[19px]  mt-[20px] max-w-[35ch] text-center mx-auto'>
                  Download the Kresus app to claim your free month of Kresus
                  Pro—a $9.99 value.
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
