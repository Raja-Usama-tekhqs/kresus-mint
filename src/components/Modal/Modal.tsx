import { assets } from '@/assets';
import {
  getClaimInfo,
  getUserWhiteListStatusHelper,
} from '@/pages/api/apiCalls';

import ShareWithFriends from '@/pages/shareWithFriends';
import SuccessfullyCreation from '@/pages/successfullyCreation';
import SuccessfullyShared from '@/pages/successfullyShared';
import { useAmplitude } from '@/provider/Amplitude';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';

const Modal = ({
  open,
  handleClose,
  screen,
  setScreen,
  selectedImage,
  sharedEmailList,
  setSharedEmailList,
}: any) => {
  const { trackEvent } = useAmplitude();
  const [claimed, setClaimed] = useState(false);

  const handleCheckStatus = async () => {
    try {
      const { subscriptionStatus } = await getUserWhiteListStatusHelper();
      setClaimed(subscriptionStatus);
    } catch (err: any) {
    } finally {
    }
  };

  useEffect(() => {
    if (open) {
      handleCheckStatus();
    }
  }, [open]);

  return (
    <BottomSheet
      onDismiss={() => handleClose()}
      open={open}
      snapPoints={({ maxHeight }) => [maxHeight * 0.93]}
      defaultSnap={({ maxHeight }) => maxHeight * 0.93}
      style={{
        zIndex: 9999,
      }}
    >
      <div className='h-[90dvh] flex flex-col pt-4  relative'>
        {screen === 'shareWithFriends' && (
          <ShareWithFriends
            setScreen={setScreen}
            selectedImage={selectedImage}
          />
        )}

        {screen === 'successfullyCreation' && (
          <SuccessfullyCreation
            list={sharedEmailList}
            setList={setSharedEmailList}
            setScreen={setScreen}
            selectedImage={selectedImage}
            claimed={claimed}
          />
        )}

        {screen === 'successfullyShared' && (
          <SuccessfullyShared
            list={sharedEmailList}
            setScreen={setScreen}
            selectedImage={selectedImage}
            claimed={claimed}
          />
        )}
        <button
          onClick={() => {
            handleClose();
            trackEvent('drawer_closed');
          }}
          className='absolute top-4 right-6'
        >
          <Image src={assets.closeButton} height={35} width={35} alt='close' />
        </button>
      </div>
    </BottomSheet>
    // <div
    //   style={{
    //     borderRadius: '20px',
    //     border: '1px solid transparent',
    //   }}
    //   className={`fixed w-[100%] top-[20px] left-0 bg-[#01032CCC] z-10 h-full flex items-end justify-center ${
    //     open ? 'show-modal' : 'hide-modal'
    //   }`}
    // >

    // </div>
  );
};

export default Modal;
