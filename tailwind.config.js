/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'bg-k-deep-blue',
    'bg-[#000000A8]',
    'fixed',
    'top-0',
    'left-0',
    'w-full',
    'h-full',
    'bg-k-midnight-blue',
    'bg-k-dark-blue',
    'z-[1000]',
    'bg-k-dark-blue',
    'border-k-medium-blue',
    'mt-[25px]',
    'mb-[38px]',
    'pb-[11px]',
    'h-[70px]',
    'w-[70px]',
    'border-b-k-midnight-blue',
    {
      pattern: /^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|h|w)-\d+$/,
    },
  ],
  theme: {
    fontSize: {
      '2xl': '24px',
      lg: '19px',
      base: '15px',
      sm: '13px',
    },
    extend: {
      backgroundImage: {
        bg_gradient: 'linear-gradient(180deg, #080C4C 0%, #0E1799 100%)',
        gradient_img: 'url(/gradient.svg)',
        gradient_img2: 'url(/bg-crop.svg)',
        btn_gradient: 'linear-gradient(180deg, #10178A 0%, #0734A9 100%)',
        btn_gradient2: 'linear-gradient(180deg, #E3E3E3 0%, #FFFFFF 100%)',
      },
      colors: {
        'k-midnight-blue': '#0734A9',
        'k-soft-blue': '#ADD2FD',
        'k-medium-blue': '#10178A',
        'k-light-blue': '#4898F3',
        'k-deep-blue': '#01032C',
        'k-dark-blue': '#080C4C',
        'k-dark-red': '#FF6961',
        'k-sky-blue': '#7AB7FD',
      },
    },
  },
  plugins: [],
};
