import React, { FC, useEffect, useState } from 'react';

interface IProps {
  selected: boolean;
  onChange: (b: boolean) => void;
  error?: boolean;
}

const Checkbox: FC<IProps> = ({ selected, onChange, error }) => {
  const [checked, setChecked] = useState(false);
  const toggle = () => {
    setChecked(!checked);
    onChange(!checked);
  };

  useEffect(() => {
    setChecked(selected);
  }, []);

  return (
    <div onClick={toggle} className='cursor-pointer'>
      {checked ? (
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <rect width='24' height='24' rx='6' fill='white' />
          <path
            d='M5.7207 11.4686L9.82675 15.6528C9.90675 15.7343 10.0377 15.7356 10.1192 15.6556L18.1847 7.75106'
            stroke='#030A74'
            stroke-width='2'
            stroke-linecap='round'
          />
        </svg>
      ) : (
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <rect
            x='0.5'
            y='0.5'
            width='23'
            height='23'
            rx='5.5'
            stroke={error ? '#FF6961' : '#D4EBFF'}
          />
        </svg>
      )}
    </div>
  );
};

export default Checkbox;
