import React, { FC } from 'react';

interface IProps {
  icon: React.ReactNode;
  message: string;
  description?: string;
}

const Snackbar: FC<IProps> = ({ icon, message, description }) => {
  return (
    <div className='max-w-md w-full mx-auto mb-4 absolute top-0 z-[100]'>
      <div className='bg-blue-100 p-4 rounded-lg shadow-lg flex items-center space-x-4'>
        <div className='text-blue-600'>{icon}</div>
        <div className='flex-1'>
          <p className='font-semibold text-black'>{message}</p>
          {description && (
            <p className='text-sm text-gray-700'>{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Snackbar;
