import React, { FC } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, Dispatch } from '@/store';

import DialogLayout from '../DialogLayout';
import Typography from '@/components/Typography/Typography';
import Image from 'next/image';
import { gradientArray } from '@/components/gradientColors';

const ContestEntry: FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const { gradient } = useSelector((state: RootState) => state.nft);

  const handleClose = () => {
    dispatch.utils.setShowContestModal(false);
  };
  return (
    <DialogLayout onClose={handleClose}>
      <div
        className='w-full max-w-[600px] border-t border-t-k-midnight-blue rounded-[20px] flex flex-col items-center px-9 pt-10 pb-7 bg-k-deep-blue'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex items-center justify-center'>
          <div className='bg-[#01021D] h-[70px] w-[70px] rounded-full border-b border-b-k-midnight-blue grid place-items-center'>
            <Image
              src={gradient || gradientArray[0]}
              height={54}
              width={54}
              alt=''
            />
          </div>
        </div>
        <Typography
          variant='2xl'
          className='text-[30px] mt-6 mb-5 font-[460]'
          family='beirut'
        >
          Entry Received
        </Typography>
        <Typography
          variant='lg'
          color='soft-blue'
          className='font-[460] text-center leading-6 max-w-[26ch]'
        >
          You’ve successfully entered the Kresus giveaway for a chance to win
          $100 of WLD!
        </Typography>
        <Typography
          variant='lg'
          color='soft-blue'
          className='font-[460] text-center leading-6 max-w-[26ch] mt-5 mb-6'
        >
          5 winners chosen weekly!
        </Typography>
        <a
          href='https://kresus.com/kresus-nft-mint-to-win-sweepstakes-official-rules/'
          rel='noreferrer'
          target='_blank'
        >
          <Typography
            variant='lg'
            color='soft-blue'
            className='font-[460] text-center leading-6 max-w-[26ch] mb-[38px] underline'
          >
            Official Rules
          </Typography>
        </a>

        <button
          className='access-my-photos font-[500] mb-5 h-[55px] disabled:bg-[#0734A9] disabled:text-k-deep-blue max-w-[100vw] w-full flex items-center justify-center text-[19px] '
          onClick={handleClose}
        >
          Got It
        </button>
      </div>
    </DialogLayout>
  );
};

export default ContestEntry;
