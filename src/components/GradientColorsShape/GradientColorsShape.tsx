import { useAmplitude } from '@/provider/Amplitude';
import React from 'react';

const GradientColorsShape = ({ gradientArray, index, setIndex }: any) => {
  const { trackEvent } = useAmplitude();
  return (
    <div
      className='relative w-full'
      // style={{ background: gradientArray[index] }}
      onClick={() => {
        if (gradientArray.length - 1 === index) {
          setIndex(0);
        } else {
          setIndex((prev: any) => prev + 1);
        }
        trackEvent('filter_circle_functioning', { filter_circle_status: true });
      }}
    >
      <div className='absolute w-full h-full rounded-full  gradient-animation'></div>
      <img src={gradientArray[index]} className='relative z-30 w-full' alt='' />
    </div>
  );
};

export default GradientColorsShape;
