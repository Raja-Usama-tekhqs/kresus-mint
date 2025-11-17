import TextField from '@/components/AppTextBox/AppTextBox';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { assets } from '@/assets';
import { useEffect, useState } from 'react';
import { getKresusFinal } from '@/components/AppLocalStorage/AppLocalStorage';
import { shareYourCreationHelper } from './api/apiCalls';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, Dispatch } from '../store/index';
import { isValidEmail } from '@/utils/common';
import { useAmplitude } from '@/provider/Amplitude';

export default function ShareWithFriends({ setScreen, selectedImage }: any) {
  const router = useRouter();
  const dispatch = useDispatch<Dispatch>();
  const [email, setEmail] = useState('');
  const [emailList, setEmailList] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { trackEvent } = useAmplitude();
  const { vault_address } = useSelector((state: RootState) => state.auth);
  const { emailSharedList, selectedNft } = useSelector(
    (state: RootState) => state.nft
  );
  const userEmail = localStorage.getItem("Email")
  useEffect(() => {
    setImage(selectedNft?.image.originalUrl || '');
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
      if (isValidEmail(email) && !emailList.includes(email)) {
        list.push(email);
      } else {
        trackEvent('email_invalid', {
          email: email,
          email_format_valid: false,
        });
        return setError('Invalid Email');
      }
    }
    if (list.length >= 1 && selectedNft) {
      setLoading(true);
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
      setEmail('');
      setLoading(false);
      trackEvent('nft_shared', {
        emails: list,
        nft_id: `Marble #${selectedNft.tokenId}`,
      });
      dispatch.nft.handleGetEmailSharedList({
        tokenId: selectedNft!.tokenId,
        address: vault_address,
      });

      setScreen('successfullyCreation');
      // router.push("/successfullyCreation");
    }
  }

  return (
    <div className='h-full '>
      <div
        style={{
          borderRadius: '20px',
          border: '1px solid transparent',
        }}
        className='flex flex-col items-center pl-[20px] pr-[20px] justify-center pt-[25px] pb-7 align-middle h-full'
      >
        {image && (
          <div className='rounded-[5px] bg-gray-200 overflow-hidden shrink-0'>
            <Image
              src={image}
              width={65}
              height={65}
              className='aspect-square'
              alt='Kresus logo'
            />
          </div>
        )}
        <span className='mt-[12px] mb-[30px] font-[460] text-[24px] font-[Beirut] text-center text-[#fff]'>
          Share your creation <br /> with friends.
        </span>
        <TextField
          error={error}
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
          disabled={emailList?.length === 3 || loading}
          onKeyUp={e => {
            var code = e.keyCode ? e.keyCode : e.which;
            if (code == 13 && email.trim()) {
              if (isValidEmail(email) && !emailList.includes(email)) {
                setEmailList(prev => [...prev, email]);
                setEmail('');
                trackEvent('email_added_to_list', {
                  email: email,
                });
              } else {
                setError('Invalid Email.');
              }
            }
          }}
          onClear={() => {
            if (loading) return;
            trackEvent('email_removed', {
              email: email,
            });
            setEmail('');
            setError('');
          }}
        />
        {error && (
          <p className="text-red-600 text-left w-full mt-1 text-sm max-w-[488px]">
            {error}
          </p>
        )}
        <div
          style={{ scrollbarWidth: 'thin' }}
          className='mt-[20px]  w-full max-w-[488px] flex-grow flex gap-2 items-center flex-col overflow-auto'
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
        <button
          onClick={shareNFTToFriends}
          className='access-my-photos font-bold  h-[55px] disabled:bg-[#0734A9] disabled:text-[#01032C]'
          style={{
            height: 55,
            width: '100%',
            color: '#181825',
          }}
          disabled={(email == "" && emailList.length === 0) || loading}
        >
          {emailList.length <= 1 ? 'Send' : 'Send Separately'}
        </button>
      </div>

    </div>
  );
}
