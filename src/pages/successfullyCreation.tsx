import TextField from '@/components/AppTextBox/AppTextBox';
import Image from 'next/image';
import { assets } from '@/assets';
import { useEffect, useState } from 'react';
import { Divider } from '@nextui-org/react';
import { shareYourCreationHelper } from './api/apiCalls';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, Dispatch } from '../store/index';
import { isValidEmail } from '@/utils/common';
import { useAmplitude } from '@/provider/Amplitude';

export default function SuccessfullyCreation({
  setScreen,
  list,
  setList,
  claimed,
}: any) {
  const dispatch = useDispatch<Dispatch>();

  const { vault_address } = useSelector((state: RootState) => state.auth);
  const { emailSharedList, selectedNft } = useSelector(
    (state: RootState) => state.nft
  );
  const { trackEvent } = useAmplitude();
  const userEmail = localStorage.getItem("Email")
  const [email, setEmail] = useState('');
  const [emailList, setEmailList] = useState<string[]>([]);
  const [error, setError] = useState('');

  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    setList(emailSharedList);
  }, [emailSharedList]);

  useEffect(() => {
    if (selectedNft) setImage(selectedNft?.image.originalUrl);
  }, [selectedNft]);

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
      if (list?.length) {
        setList([...emailSharedList, ...emailList]);
      } else {
        setList(emailList);
      }
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

      dispatch.nft.handleGetEmailSharedList({
        address: vault_address,
        tokenId: selectedNft?.tokenId,
      });
      setEmail('');
      // router.push("/successfullyCreation");
    }
    setScreen('successfullyShared');
  }

  return (
    <div
      style={{
        borderRadius: '20px',
        border: '1px solid transparent',
      }}
      className='bg-[#01032CCC] h-full'
    >
      <div className='flex flex-col pl-[20px] pr-[20px] items-center  pt-6 pb-[2.5rem] align-middle h-full'>
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
              label={'Enter Another Email'}
              showButton
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setError('');
              }}
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
                    setError('Invalid Email');
                  }
                }
              }}
              disabled={list?.length + emailList?.length === 3}
              onClear={() => {
                trackEvent('email_removed', {
                  email: email,
                });
                setEmail('');
                setError("")
              }}
              error={error}
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
                  const newEmailList = emailList.filter(
                    (x, mIndex) => mIndex !== index
                  );
                  setEmailList(newEmailList);
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
            {(list as string[])?.map((email, index) => (
              <div key={index} className='flex gap-2 items-center'>
                <Image src={assets.sucess} alt='' />
                <span>{email}</span>
              </div>
            ))}
          </div>
          <button
            onClick={shareNFTToFriends}
            className='access-my-photos font-bold h-fit w-full mt-[20px] disabled:bg-[#0734A9] disabled:text-[#01032C]'
            style={{
              height: 55,
              width: '100%',
              color: '#181825',
            }}
            disabled={!(emailList.length >= 1 || email)}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
