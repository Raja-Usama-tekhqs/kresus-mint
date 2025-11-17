import { assets } from '@/assets';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Typography from '../Typography/Typography';
import { checkGiveAwayTime } from '@/http';
import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const checkTimeDifference = (unixTimestamp: string) => {
  const localTime = dayjs.unix(+unixTimestamp).utc(); // Timestamp in UTC
  const currentTime = dayjs().utc(); // Current time in UTC

  if (localTime.isAfter(currentTime)) {
    // Calculate the difference in seconds
    const differenceInSeconds = localTime.diff(currentTime, 'second');
    console.log(differenceInSeconds);
    return differenceInSeconds;
  } else {
    console.log(0);
    return 0;
  }
};

const formatTime = (seconds: number) => {
  const days = String(Math.floor(seconds / (3600 * 24))).padStart(2, '0');
  const hours = String(Math.floor((seconds % (3600 * 24)) / 3600)).padStart(
    2,
    '0'
  );
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const sec = String(Math.floor(seconds % 60)).padStart(2, '0');

  return `${days} : ${hours} : ${minutes} : ${sec}`;
};

const RewardTimer = () => {
  const [timeLeft, setTimeLeft] = useState(0);

  const handleTimeLeft = async () => {
    try {
      const { data } = await checkGiveAwayTime();
      const differenc = checkTimeDifference(data.timestampToStart);
      setTimeLeft(differenc);
    } catch (err: any) {}
  };

  useEffect(() => {
    let interval: any;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timeLeft]);

  useEffect(() => {
    handleTimeLeft();
  }, []);

  return (
    <>
      {timeLeft > 0 && (
        <>
          <div className='border-t border-t-k-midnight-blue mb-[15px]'></div>
          <div className='flex items-center gap-[14px]'>
            <Image
              src={assets.dollar}
              width={50}
              height={50}
              alt='dollar-icon'
            />
            <div>
              <Typography color='soft-blue' weight='medium'>
                Next five $100 WLD winners in:
              </Typography>
              <Typography variant='lg' className='mt-[2px]'>
                {formatTime(timeLeft)}
              </Typography>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default RewardTimer;
