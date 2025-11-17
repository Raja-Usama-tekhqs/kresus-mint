import React, { FC } from 'react';

import { twMerge } from 'tailwind-merge';
import { cva, VariantProps } from 'class-variance-authority';

const variants = cva('font-normal text-base', {
  variants: {
    variant: {
      '2xl': 'text-2xl',
      lg: 'text-lg',
      base: 'text-base',
      sm: 'text-sm',
    },
    color: {
      white: 'text-white',
      'soft-blue': 'text-k-soft-blue',
      error: 'text-k-dark-red',
      'sky-blue': 'text-k-sky-blue',
    },
    weight: {
      normal: 'font-[382]',
      medium: 'font-medium',
      semibold: 'font-[660]',
      bold: 'font-bold',
    },
    family: {
      beirut: 'font-[Beirut]',
      messina: 'font-[MessinaSans]',
    },
  },
  defaultVariants: {
    variant: 'base',
    color: 'white',
    weight: 'normal',
    family: 'messina',
  },
});

interface TypographyProps extends VariantProps<typeof variants> {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const Typography: FC<TypographyProps> = ({
  variant,
  color,
  weight,
  className,
  family,
  children,
  onClick,
}) => {
  return (
    <p
      className={twMerge(
        variants({ variant, color, weight, family, className })
      )}
      onClick={() => {
        typeof onClick === 'function' && onClick();
      }}
    >
      {children}
    </p>
  );
};

export default Typography;

// 24px,19px, 15px, 13px,
