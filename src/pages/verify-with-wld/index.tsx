import React from 'react';
import Image from 'next/image';
import { VerifyBlock } from '@/components/VerifyWithWLD/VerifyWithWLD';

const index = () => {
  return (
    <div className='h-[100dvh]'>
      <div className=' min-h-[100dvh] w-full absolute  flex flex-col'>
        <div className='flex-grow bg-bg_gradient mb-[-60px]'></div>
        <div className='mt-auto'>
          <div className='flex items-center h-[60px]'>
            <div className='relative w-[50%] h-[60px]'>
              <Image src='/land1.png' alt='' fill />
            </div>
            <div className='absolute right-0 w-[70%] h-[60px]'>
              <Image src='/land2.png' alt='' fill />
            </div>
          </div>
          <div className='relative h-[172px]'>
            <Image src='/waves.png' fill alt='' />
          </div>
        </div>
      </div>
      <VerifyBlock />
      <div className='absolute w-full flex flex-col px-[24px] pb-[30px] items-center justify-between align-middle h-[100dvh] z-30 '></div>
    </div>
  );
};

export default index;
