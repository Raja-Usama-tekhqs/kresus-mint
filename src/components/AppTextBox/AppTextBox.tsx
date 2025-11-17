import React, { FC, InputHTMLAttributes, useId } from 'react';
import Image from 'next/image';
import { assets } from '@/assets';
import classNames from 'classnames';

interface IProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  showButton?: boolean;
  onClear?: () => void;
  error?: string;
}

const TextField: FC<IProps> = ({
  value,
  label,
  showButton,
  onClear,
  error,
  ...rest
}) => {
  const id = useId();

  return (
    <label htmlFor={id} className='w-full'>
      <div
        className={classNames(
          'w-full  bg-[#0e1273 !important] h-[65px] border border-[#0734A9] flex flex-col px-3 py-2 rounded-[12px] relative group focus-within:border-k-black focus-within:border-2 focus-within:border-[#4898F3] has-[input:not(:placeholder-shown)]:border-k-black has-[input:not(:placeholder-shown)]:border-2 has-[input:not(:placeholder-shown)]:!border-[#4898F3] bg-[#00000014] has-[input:not(:placeholder-shown)]:bg-[#00000026]',
          error && '!border-red-600'
        )}
      >
        <input
          className='w-full peer border bg-transparent text-[19px] leading-6 border-k-black outline-none border-none text-lg mt-auto placeholder:text-transparent caret-[#CEB55A] disabled:text-white'
          placeholder='hi'
          value={value}
          {...rest}
          id={id}
        />
        <p
          className='text-lg text-[#ADD2FD] absolute top-[18px] peer-[:focus]:text-[13px] peer-[:focus]:translate-y-0 peer-[:focus]:top-2 peer-[:focus]:leading-[17px]
      peer-[:not(:placeholder-shown)]:text-[13px]  peer-[:not(:placeholder-shown)]:top-2 transition-[top] peer-[:not(:placeholder-shown)]:leading-[17px]'
        >
          {label}
        </p>
        {/* <p
          className='text-lg text-[#ADD2FD] absolute top-4 peer-[:focus]:text-sm peer-[:focus]:translate-y-0 peer-[:focus]:top-2
      peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:top-2 transition-all duration-200 ease
      '
        >
          {label}
        </p> */}
        {showButton && value && (
          <div
            className='size-10 absolute top-[50%] right-[10px] translate-y-[-50%] bg-k-dark-blue rounded-full grid place-items-center cursor-pointer'
            role='button'
            onClick={() => {
              if (typeof onClear === 'function') onClear();
            }}
          >
            <Image src={assets.close} alt='' />
          </div>
        )}
      </div>
    </label>
  );
};

export default TextField;
