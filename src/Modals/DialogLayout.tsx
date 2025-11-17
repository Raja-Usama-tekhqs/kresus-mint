import classNames from 'classnames';
import React, { FC, useEffect } from 'react';

interface IProps {
  onClose: () => void;
  children: React.ReactNode;
}

const DialogLayout: FC<IProps> = ({ onClose, children }) => {
  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div
      className={classNames(
        'fixed top-0 left-0 w-full h-full z-[1000]  flex flex-col justify-center bg-[#000000A8] px-[15px]'
      )}
      onClick={handleClose}
    >
      {children}
    </div>
  );
};

export default DialogLayout;
