import React, { FC } from 'react';
import Image from 'next/image';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';

import { getMobileOS } from '@/components/GetFile/GetFile';
import { INft } from '@/types/interfaces';
import DialogLayout from '../DialogLayout';
import Typography from '@/components/Typography/Typography';
import { useAmplitude } from '@/provider/Amplitude';

interface IProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedNft: INft | null;
}

const DownLoadKresus: FC<IProps> = ({ open, setOpen, selectedNft }) => {
  const { trackEvent } = useAmplitude();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleClose = () => {
    setOpen(false);
    trackEvent('popup_closed', {
      popup_status: 'closed',
    });
  };

  return (
    <DialogLayout onClose={handleClose}>
      <div
        className='w-full max-w-[600px] border-t border-t-k-midnight-blue rounded-[20px] flex flex-col items-center px-9 pt-10 pb-7 bg-k-deep-blue'
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={selectedNft?.image.originalUrl || ''}
          width={69}
          height={69}
          className='rounded-md'
          alt=''
        />
        <Typography
          variant='2xl'
          className='text-[30px] mt-6 mb-5 font-[460]'
          family='beirut'
        >
          Download Kresus
        </Typography>
        <Typography
          variant='lg'
          color='soft-blue'
          className='font-[460] text-center leading-6 max-w-[26ch]'
        >
          Register your Kresus account with this email address to ensure your
          NFT Badge is waiting for you in your Kresus Wallet.
        </Typography>

        <div className='bg-k-dark-blue px-[15px] pt-2 pb-[11px] rounded-3xl border border-k-medium-blue mt-[25px] mb-[38px]'>
          <Typography>{user?.email}</Typography>
        </div>
        <button
          className='access-my-photos font-[500] mb-5 h-[55px] disabled:bg-[#0734A9] disabled:text-k-deep-blue max-w-[100vw] w-full flex items-center justify-center text-[19px] '
          onClick={() => {
            const os = getMobileOS();
            trackEvent('download_button_popup_clicked', {
              button_name: 'Download Now',
              action: `Redirected to ${
                os === 'iOS' ? 'App Store' : 'Play Store'
              }`,
            });
            if (os === 'iOS') {
              window.location.href =
                'https://apps.apple.com/us/app/kresus-base-wallet/id6444355152';
            } else {
              window.location.href =
                'https://play.google.com/store/apps/details?id=com.kresus.superapp&hl=en';
            }
          }}
        >
          Download Now
        </button>
        <button
          className=' font-[500] h-[35px] disabled:bg-[#0734A9] disabled:text-[#01032C]  flex items-center pt-2 px-[18px] justify-center text-[19px] '
          onClick={() => {
            trackEvent('dismiss_button_popup_clicked', {
              button_name: 'Dismiss',
              action: 'close popup',
            });
            handleClose();
          }}
        >
          Dismiss
        </button>
      </div>
    </DialogLayout>
  );
};

export default DownLoadKresus;
