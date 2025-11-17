import React, { useCallback, useEffect, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, Dispatch } from '../store';
import { useRouter } from 'next/navigation';

import Cropper from 'react-easy-crop';

import Image from 'next/image';
import getCroppedImg from '@/utils/crop';
import withAuth from '@/hoc/withAuth';
import { debounce } from '@/utils/common';
import { ClipLoader } from 'react-spinners';
import { assets } from '@/assets';
import Checkbox from '@/components/Checkbox/Checkbox';
import Typography from '@/components/Typography/Typography';
import { useAmplitude } from '@/provider/Amplitude';

const cropImage = () => {
  const dispatch = useDispatch<Dispatch>();
  const router = useRouter();
  const { trackEvent } = useAmplitude();

  const [copyrights, setCopyrights] = useState(false);
  const [error, setError] = useState(false);
  const [rotation, setRotation] = useState(0);
  const {
    uploadedImage,
    originalImage,
    crop: sCrop,
    zoom: sZoom,
  } = useSelector((state: RootState) => state.nft);
  const [crop, setCrop] = useState(sCrop);
  const [zoom, setZoom] = useState(sZoom);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(originalImage)

  const handleCheckbox = (val: boolean) => {
    if (val) {
      trackEvent('checkbox_checked', {
        checkbox_status: true,
      });
    } else {
      trackEvent('checkbox_unchecked', {
        checkbox_status: false,
      });
    }
    setError(false);
    setCopyrights(val);
  };

  const onCropComplete = useCallback(
    debounce(
      async (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
      },
      100 // Adjust delay as needed
    ),
    [uploadedImage, rotation] // Dependencies
  );

  const handleZoom = useCallback(
    debounce((z: number, prev: number) => {
      if (z <= prev) {
        trackEvent('photo_zoom_out', {
          zoom_level: z,
        });
      } else {
        trackEvent('photo_zoom_in', {
          zoom_level: z,
        });
      }
    }, 100),
    []
  );

  const handleCustomize = async () => {
    try {
      if (!copyrights) {
        return setError(true);
      }
      trackEvent('customize_button_clicked', {
        button_name: 'Continue to Customize',
        screen: 'Customize Filter',
      });
      setLoading(true);
      const croppedImage = await getCroppedImg(
        uploadedImage,
        croppedAreaPixels,
        -rotation
      );
      dispatch.nft.setUploadedImage(croppedImage as string);
      dispatch.nft.setOriginalImage(image as string);
      router.push('/uploadSave');
    } catch (err: any) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRotate = () => {
    if (rotation === 360) {
      setRotation(90);
      trackEvent('photo_rotated', {
        rotation_angle: 90,
      });
    } else {
      setRotation(rotation + 90);
      trackEvent('photo_rotated', {
        rotation_angle: rotation + 90,
      });
    }
  };

  const handleBack = () => {
    router.back();
  };
  useEffect(() => {
    dispatch.nft.setZoom(1);
    if (uploadedImage) {
      setImage(uploadedImage);
    }
  }, [uploadedImage])
  useEffect(() => {
    if (!uploadedImage) {
      router.replace('/uploadImage');
    }
  }, [uploadedImage]);

  return (
    <div className='bg-[#01032C] h-[100dvh] bg-cover bg-center bg-no-repeat'>
      <div className='w-full flex flex-col h-full  '>
        <div className='flex flex-col flex-grow h-0 overflow-auto bg-gradient_img2 bg-center bg-cover bg-no-repeat'>
          <div className='flex items-center justify-between w-full min-h-[65px] px-3'>
            <Image
              src={assets.back}
              width={35}
              height={35}
              className='cursor-pointer'
              alt='chevron-left'
              onClick={handleBack}
            />
            <Typography variant='lg'>Adjust Photo</Typography>
            <div className='w-[35px]' />
          </div>
          <div className='px-[15px]'>
            <div className='relative w-full aspect-square bg-white rounded-[20px] overflow-hidden shrink-0 !px-[15px]'>
              <Cropper
                image={
                  typeof image === 'string' ? image : URL.createObjectURL(image)
                }
                crop={crop}
                zoom={zoom}
                onCropChange={(v: any) => {
                  setCrop(v);
                  dispatch.nft.setCrop(v);
                }}
                onCropComplete={onCropComplete}
                onZoomChange={z => {
                  dispatch.nft.setZoom(z);
                  setZoom((prev: number) => {
                    handleZoom(z, prev);
                    return z;
                  });
                }}
                aspect={1 / 1}
                showGrid={false}
                rotation={-rotation}
                objectFit='cover'
              />
              <div
                className='absolute z-10 right-[10px] bottom-[10px] w-[35px] h-[35px] grid place-items-center bg-[#00000070] rounded-full cursor-pointer'
                onClick={handleRotate}
              >
                <Image src='/rotate.svg' width={14} height={14} alt='' />
              </div>
            </div>
          </div>

          <div className='flex flex-grow items-center justify-center flex-col gap-5 py-3'>
            <Image src='/pinch.svg' width={30} height={30} alt='pinch' />
            <Typography className='text-[#FFFFFFA8]' weight='medium'>
              Pinch to zoom.
            </Typography>
          </div>
        </div>
        <div className='bg-[#01032CCC] border-t border-t-[#030A74] pt-[15px] px-5 pb-[30px]'>
          <div className='flex items-center gap-[10px] mb-6'>
            <Checkbox
              selected={copyrights}
              onChange={handleCheckbox}
              error={error}
            />
            <Typography color={error ? 'error' : 'white'}>
              I certify that I own the full copyright to this image
            </Typography>
          </div>
          <button
            className='access-my-photos font-bold !mb-6 h-[55px] disabled:bg-[#0734A9] disabled:text-[#01032C] max-w-[100vw] w-full flex items-center justify-center'
            onClick={handleCustomize}
            disabled={loading || error}
          >
            {loading ? (
              <ClipLoader size={20} color='#fff' />
            ) : (
              'Continue to Customize'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default withAuth(cropImage);
