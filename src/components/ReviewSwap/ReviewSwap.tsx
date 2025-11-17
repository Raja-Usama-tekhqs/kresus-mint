import React, { useEffect, useState, useContext } from 'react';
import { Card, CardHeader } from '@nextui-org/react';
import GradientColorsShape from '../GradientColorsShape/GradientColorsShape';
import { gradientArray } from '../gradientColors';
import { useRouter } from 'next/navigation';
import { mintNFTHelper } from '../../pages/api/apiCalls';
import MagicProvider, { MagicContext, useMagic } from '../magic/MagicProvider';
import { ethers } from 'ethers';

import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../../store';
import { sleep } from '@/utils/common';
import { getNFTForOwnerHelper } from '@/alchemy/alchemy';
import { INftResponse } from '@/types/interfaces';
import { useAmplitude } from '@/provider/Amplitude';

const ReviewSwap = () => {
  const router = useRouter();
  const { trackEvent } = useAmplitude();
  const dispatch = useDispatch<Dispatch>();

  const { vault_address, user, wldWallet_address } = useSelector(
    (state: RootState) => state.auth
  );
  const {
    finalImage: image,
    index: gIndex,
    ipfsHash,
    addToGiveAway,
  } = useSelector((state: RootState) => state.nft);

  const [showSecond, setShowSecond] = useState(false);
  const [index, setIndex] = useState(0);

  const [vaultAddress, setVaultAddress] = useState('');

  const { magic } = useContext(MagicContext);

  const handleMintNft = async () => {
    try {
      console.log('vault Address', vault_address);
      const provider = new ethers.providers.Web3Provider(
        magic?.rpcProvider as any
      );
      const signer = provider.getSigner();
      let address = user?.publicAddress;
      const isLoggedIn = await magic!.user.isLoggedIn();
      if (!isLoggedIn) {
        router.push('/');
      } else {
        address = await signer.getAddress();
      }
      let msgData = {
        signerAddress: address, // verification address
        vaultAddress: vault_address,
        ipfsHash: ipfsHash,
      };
      const msgDataString = JSON.stringify(msgData);
      console.log('msgDataString: ', msgDataString);
      const signature = await signer.signMessage(msgDataString); // sign
      console.log('signature: ', signature);
      console.log('Message signing');
      let params = {
        ...msgData,
        signature: signature,
      };
      // @ts-ignore
      const prev: INftResponse = await getNFTForOwnerHelper(vault_address);
      const prevCount = prev.balance;

      const a = wldWallet_address.length ? wldWallet_address : 'null';

      var res = await mintNFTHelper(
        ipfsHash,
        vault_address,
        params,
        addToGiveAway,
        a
      );
      await sleep(1000);
      // @ts-ignore
      let after: INftResponse = await getNFTForOwnerHelper(vault_address);
      let afterCount = after.balance;
      while (prevCount === afterCount) {
        await sleep(1000);
        // @ts-ignore
        after = await getNFTForOwnerHelper(vault_address);
        afterCount = after.balance;
      }
      // setMintedHash(mintNFTResult);
      dispatch.utils.setShowContestModal(res ? res?.giveAwayEntryAdded : false);
      trackEvent('nft_minted', {
        screen: 'Mint Complete',
      });
      router.replace('/MintCompete');
    } catch (err: any) {
      console.log(err.message);
      router.replace('/MintCompete');
    } finally {
    }
  };

  useEffect(() => {
    if (!vaultAddress) setVaultAddress(vault_address);
  }, [vault_address]);

  useEffect(() => {
    setIndex(gIndex);
    setShowSecond(true);
  }, []);

  useEffect(() => {
    if (magic && vault_address) {
      console.log(vault_address);
      setTimeout(() => handleMintNft(), 50);
    }
  }, [magic, vault_address]);

  if (!ipfsHash) {
    router.replace('/uploadImage');
    return null;
  }

  return (
    <div className='flex flex-col items-center justify-between align-middle min-h-screen bg-[#01032C] overflow-x-hidden'>
      <Card
        className='rounded-md w-full overflow-visible'
        style={{ borderRadius: 10 }}
      >
        <CardHeader className='p-[10px] flex justify-center items-center '>
          {showSecond ? (
            <div className='flex overflow-visible justify-center items-center z-0  review-swap p-4'>
              <div className='bg-[#01032C] rounded-[14px] z-20 w-full h-full flex items-center justify-center overflow-hidden p-7'>
                <GradientColorsShape
                  gradientArray={gradientArray}
                  index={index}
                  setIndex={setIndex}
                />
              </div>
            </div>
          ) : (
            <div className='w-full rounded-[20px] aspect-square bg-gray-200'>
              <div className='relative w-full h-full rounded-md overflow-hidden flex items-center justify-center flex-col cursor-pointer gap-4'>
                {image && (
                  <>
                    <img src={image} width={363} height={363} alt='' />
                  </>
                )}
              </div>
            </div>
          )}
        </CardHeader>
      </Card>
      <Card
        className='rounded-md flex-grow flex items-center justify-center'
        style={{ borderRadius: 10 }}
      >
        <div className='flex flex-col items-center gap-3'>
          <span
            className='text-[15px] font-[500] text-center leading-[19px] text-[#FFFFFF] '
            style={{ fontFamily: 'MessinaSans' }}
          >
            Minting
          </span>
          <span
            className='text-[#7AB7FD] text-center text-[15px] font-[500] leading-[19px] max-w-[35ch]'
            style={{ fontFamily: 'MessinaSans' }}
          >
            Your Worldcoin collectible is being immortalized on the blockchain.
          </span>
        </div>
      </Card>
    </div>
  );
};

export default ReviewSwap;
