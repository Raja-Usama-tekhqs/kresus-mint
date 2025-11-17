import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '@/store';

import CanvasContainer from '@/components/Canvas/Canvas';
import {
  setKresusFinal,
  setKresusIndex,
} from '@/components/AppLocalStorage/AppLocalStorage';
import Image from 'next/image';
import { assets } from '@/assets';
import classNames from 'classnames';
import withAuth from '@/hoc/withAuth';
import Typography from '@/components/Typography/Typography';
import { useAmplitude } from '@/provider/Amplitude';

const UploadSave = () => {
  const router = useRouter();

  const dispatch = useDispatch<Dispatch>();
  const { trackEvent } = useAmplitude();

  const { gradient, uploadedImage, index } = useSelector(
    (state: RootState) => state.nft
  );

  const [image, setImage] = useState<string | File | null>(null);
  const [gradientImage, setGradientImage] = useState<string | null>(null);
  const [finalData, setFinalData] = useState<string | null>(null);
  const [isAddToText, setIsAddToText] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [takeImage, setTakeImage] = useState(false);

  useEffect(() => {
    setImage(uploadedImage);
    setGradientImage(gradient);
  }, []);

  const Navigation = () => {
    trackEvent('continue_to_review_button_clicked', {
      button_name: 'Continue to Review',
      screen: 'Review',
    });
    setKresusFinal(finalData as string);
    setKresusIndex(index as any);
    dispatch.nft.setFinalImage(finalData as string);
    dispatch.nft.setIndex(index);
    router.push('/verifyWithWorldIdToMintNFT');
  };

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    if (!uploadedImage) {
      router.replace('/uploadImage');
    }
  }, []);

  return (
    <div className='flex flex-col bg-gradient_img bg-cover bg-no-repeat items-center justify-between align-middle min-h-[100dvh] bg-[#01032C]'>
      <div className='flex flex-col flex-grow h-0 overflow-auto'>
        <div className='flex items-center justify-between w-full min-h-[65px] '>
          <Image
            src={assets.back}
            width={35}
            height={35}
            className='cursor-pointer'
            alt='chevron-left'
            onClick={handleBack}
          />

          <Typography variant='lg'>
            {isAddToText ? 'Add Text' : 'Customize Filter'}
          </Typography>
          <div className='w-[35px]' />
        </div>
        <div
          className={classNames('mt-[15px]')}
          // className="bg-[white] rounded-[30px] w-[363px] h-[363px]"
        >
          {/* <canvas id="canvas" width="363px" height="363px"></canvas>*/}

          <CanvasContainer
            image={image}
            gradientImage={gradientImage}
            setFinalData={setFinalData}
            isAddToText={isAddToText}
            index={index}
            editMode={editMode}
            setEditMode={setEditMode}
          />
        </div>
        <div className='flex-grow flex flex-col items-center justify-center py-[50px]'>
          {isAddToText ? (
            <div className='flex items-center justify-start flex-col gap-[14px]'>
              <Image src='/aa.svg' width={32} height={19} alt='' />
              <Typography
                weight='medium'
                className='max-w-[30ch] text-center text-[#FFFFFFA8]'
              >
                Personalize it with a custom message.
              </Typography>
            </div>
          ) : (
            <div className='flex items-center justify-start flex-col gap-[14px]'>
              <Image src='/touch-icon.svg' width={29} height={35} alt='' />

              <Typography
                weight='medium'
                className='max-w-[30ch] text-center text-[#FFFFFFA8]'
              >
                Tap to explore the colorways of your Worldcoin filter.
              </Typography>
            </div>
          )}
        </div>
      </div>

      <div className='main-card bg-[#01032CCC] pl-[20px] pr-[20px] pt-[15px] pb-[15px] flex gap-4 flex-col justify-center border-t-[1px] border-t-[#030A74]'>
        <button
          onClick={() => {
            if (isAddToText) {
              Navigation();
            } else {
              setIsAddToText(true);
              setEditMode(true);
              trackEvent('continue_to_add_text_button_clicked', {
                button_name: 'Continue to Add Text',
                screen: 'Add Text',
              });
              trackEvent('text_editor_opened');
            }
          }}
          style={{ width: '100%' }}
          className='access-my-photos cursor-pointer mb-2 disabled:bg-[#0734A9] disabled:text-[#01032C]'
          disabled={editMode}
        >
          {isAddToText ? 'Continue to Review' : 'Continue to Add Text'}
        </button>

        {!isAddToText && (
          <span
            onClick={() => {
              trackEvent('skip_button_clicked', {
                button_name: 'Skip',
                screen: 'Review',
              });
              Navigation();
            }}
            className='text-[15px] leading-[19px] mb-2 font-[446] text-center cursor-pointer'
          >
            Skip
          </span>
        )}
      </div>
    </div>
  );
};

export default withAuth(UploadSave);
