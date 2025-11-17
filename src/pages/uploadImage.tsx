import React, { useState, useRef, useEffect } from 'react';
import TakePicture from '@/components/TakePicture/TakePicture';
import { useRouter } from 'next/navigation';
import { gradientArray } from '@/components/gradientColors';

import GradientColorsShape from '@/components/GradientColorsShape/GradientColorsShape';
import Image from 'next/image';

import { useDispatch } from 'react-redux';
import { Dispatch } from '@/store';
import { assets } from '@/assets';
import withAuth from '@/hoc/withAuth';
import Typography from '@/components/Typography/Typography';
import { useAmplitude } from '@/provider/Amplitude';

const UploadImage = () => {
  const router = useRouter();

  const dispatch = useDispatch<Dispatch>();
  const { trackEvent } = useAmplitude();

  const [index, setIndex] = useState(0);
  const [isTakePhoto, setIsTakePhoto] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch.nft.setZoom(1);
    setIsSubmitted(true);
    const file = event.target.files?.[0];
    const mIndex: any = index;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleNavigation(reader.result as string, mIndex);
      };
      reader.readAsDataURL(file);
    } else setIsSubmitted(false);
  };

  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch.nft.setZoom(1);
    const file = event.target.files?.[0];
    const mIndex: any = index;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleNavigation(reader.result as string, mIndex);
      };
      reader.readAsDataURL(file);
    } else setIsSubmitted(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleNavigation = (result: string, index: any) => {
    dispatch.nft.setUploadedImage(result as string);
    dispatch.nft.setGradient(gradientArray[index]);
    dispatch.nft.setIndex(index);
    setIsSubmitted(false);
    router.push('/cropImage');
  };

  useEffect(() => {
    trackEvent('access_my_photos_present', {
      button_name: 'Access my photos',
    });
  }, []);

  return (
    <>
      <div className='h-[100dvh] w-screen absolute bg-[#01032C]'></div>
      <div className='absolute z-10 w-full flex flex-col items-center align-middle h-[100dvh]  overflow-x-hidden'>
        {isTakePhoto ? (
          <TakePicture
            setImage={setImage}
            handleNavigation={handleNavigation}
            setIsTakePhoto={setIsTakePhoto}
            index={index}
          />
        ) : (
          <>
            <div className='flex items-center justify-between w-full min-h-[65px] mb-[60px] px-3'>
              <Image
                src={assets.back}
                width={35}
                height={35}
                className='cursor-pointer'
                alt='chevron-left'
                onClick={handleBack}
              />
              <Typography variant='lg'>Select Photo</Typography>
              <div className='w-[35px]' />
            </div>
            <div className='w-full px-[60px]'>
              <GradientColorsShape
                gradientArray={gradientArray}
                index={index}
                setIndex={setIndex}
              />
            </div>
            {/* <div className="gradient-picker"></div> */}

            <div className='flex flex-col items-center gap-[15px] mt-[60px]'>
              <Image src='mint-icon.svg' alt='' height={27} width={23} />
              <Typography color='sky-blue' className='max-w-[25ch] text-center'>
                Add a photo below to see your exclusive filter.
              </Typography>
            </div>

            <div className=' pb-[30px] w-full px-5 mt-auto'>
              <div className='flex flex-col gap-[10px] mt-[20px]'>
                <button
                  className='access-my-photos !font-[MessinaSans] font-[660] text-[19px] leading-[24px] min-h-[55px] disabled:bg-[#0734A9] disabled:text-[#01032C]'
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  disabled={isSubmitted}
                >
                  {isSubmitted ? 'Please wait...' : 'Access My Photos'}
                </button>
                <button
                  // onClick={() => setIsTakePhoto(true)}
                  onClick={() => {
                    videoRef.current?.click();
                    trackEvent('take_a_photo_functioning', {
                      redirected_to_camera: true,
                      screen: 'Select Photo',
                    });
                  }}
                  className='take-photo !border-[#4898F3] flex justify-center items-center gap-[10px] !w-full min-h-[55px] font-[660] disabled:!border-[#0734A9] disabled:text-[#086DE1]'
                  disabled={isSubmitted}
                >
                  <Image
                    src={isSubmitted ? assets.camera_blue : 'camera.svg'}
                    width={24}
                    height={21}
                    alt=''
                  />
                  <span className='font-[660] !font-[MessinaSans] text-[19px] leading-[24px]'>
                    Take a Photo
                  </span>
                </button>
              </div>
            </div>
            <input
              type='file'
              ref={videoRef}
              style={{ display: 'none' }}
              accept='image/*'
              capture
              onChange={handleCapture}
            />
            <input
              type='file'
              ref={fileInputRef}
              accept='image/*'
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </>
        )}
      </div>
    </>
  );
};

export default withAuth(UploadImage);
