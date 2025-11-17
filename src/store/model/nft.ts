import { createModel } from '@rematch/core';
import { RootModel } from '.';
import { getNFTForOwnerHelper } from '@/alchemy/alchemy';
import { INft, INftResponse } from '@/types/interfaces';
import { getYourSharedCreationInfoHelper } from '@/pages/api/apiCalls';

interface IState {
  loading: boolean;
  nfts: INft[];
  nftImages: string[];
  finalImage: string;
  index: number;
  ipfsHash: string;
  txCost: any;
  uploadedImage: string | File;
  originalImage: string | File;
  gradient: string;
  time: string;
  contractAddress: string;
  tokenType: null | string;
  selectedNft: INft | null;
  emailSharedList: string[];
  whiteListed: boolean;
  addToGiveAway: boolean;
  crop: any;
  zoom: number;
}

export const nft = createModel<RootModel>()({
  name: 'nft',
  state: {
    loading: false,
    nfts: [],
    nftImages: [],
    ipfsHash: '',
    originalImage: '',
    txCost: '',
    index: 0,
    finalImage: '',
    uploadedImage: '',
    gradient: '',
    time: '',
    contractAddress: '',
    tokenType: null,
    selectedNft: null,
    emailSharedList: [],
    whiteListed: false,
    //  Remove prize change 4
    addToGiveAway: false,
    crop: { x: 0, y: 0 },
    zoom: 1,
  } as IState,
  reducers: {
    setLoading(state, payload: boolean) {
      state.loading = payload;
    },
    setNfts(state, payload: any[]) {
      state.nfts = payload;
    },
    setFinalImage(state, payload: string) {
      state.finalImage = payload;
    },
    setIndex(state, payload: number) {
      state.index = payload;
    },
    setIpfsHash(state, payload: string) {
      state.ipfsHash = payload;
    },
    setTxCost(state, payload: string) {
      state.txCost = payload;
    },
    setUploadedImage(state, payload: string | File) {
      state.uploadedImage = payload;
    },
    setGradient(state, payload: string) {
      state.gradient = payload;
    },
    setNftImages(state, payload: string[]) {
      state.nftImages = payload;
    },
    setTime(state, payload: string) {
      state.time = payload;
    },
    setContractAddress(state, payload: string) {
      state.contractAddress = payload;
    },
    setTokenType(state, payload: string | null) {
      state.tokenType = payload;
    },
    setSelectedNft(state, payload: INft | null) {
      state.selectedNft = payload;
    },
    setEmailSharedList(state, payload: string[]) {
      state.emailSharedList = payload;
    },
    setWhiteListed(state, payload: boolean) {
      state.whiteListed = payload;
    },
    setAddToGiveAway(state, payload: boolean) {
      state.addToGiveAway = payload;
    },
    setOriginalImage(state, payload: string | File) {
      state.originalImage = payload;
    },
    setZoom(state, payload: number) {
      state.zoom = payload;
    },
    setCrop(state, payload: any) {
      state.crop = payload;
    },
    reset(state) {
      state.uploadedImage = '';
      // state.finalImage = '';
      state.txCost = '';
      state.index = 0;
      state.ipfsHash = '';
      state.originalImage = '';
      state.crop = { x: 0, y: 0 };
      state.zoom = 1;
    },
  },
  effects: dispatch => ({
    async handleGetNfts(payload: string, state) {
      const address = state.auth.vault_address;
      try {
        dispatch.nft.setSelectedNft(null);
        const vault_address = payload || address;
        dispatch.nft.setLoading(true);
        // @ts-ignore
        const getNFTForOwnerHelperResult: INftResponse =
          await getNFTForOwnerHelper(vault_address);
        if (getNFTForOwnerHelperResult) {
          if (getNFTForOwnerHelperResult?.nftDetails?.length > 1) {
            getNFTForOwnerHelperResult?.nftDetails?.sort((a: any, b: any) => {
              return b.tokenId - a.tokenId;
            });
          }

          try {
            getNFTForOwnerHelperResult.nftDetails?.map(
              (item: any, index: any) => {
                item.image.originalUrl = item.image.originalUrl.replace(
                  'https://ipfs.io',
                  `https://${process.env.NEXT_PUBLIC_PINATA_SERVER}`
                );
                // if (index === 0) {
                //   if (state.nft.finalImage) {
                //     item.image.originalUrl! = state.nft.finalImage;
                //   }
                // }
              }
            );
          } catch (err) {}

          dispatch.nft.setNfts(getNFTForOwnerHelperResult.nftDetails);
          dispatch.nft.setNftImages(getNFTForOwnerHelperResult.nftsImages);
          dispatch.nft.setTime(getNFTForOwnerHelperResult.timeLastUpdated!);
          dispatch.nft.setContractAddress(
            getNFTForOwnerHelperResult.contractAddress
          );
          dispatch.nft.setTokenType(getNFTForOwnerHelperResult.tokenType);
          if (getNFTForOwnerHelperResult?.nftDetails?.length) {
            dispatch.nft.setSelectedNft(
              getNFTForOwnerHelperResult.nftDetails[0]
            );
          }
        }
      } catch (err: any) {
        console.log(err.message);
      } finally {
        dispatch.nft.setLoading(false);
      }
    },
    async handleGetEmailSharedList(payload: {
      address: string;
      tokenId: string;
    }) {
      try {
        const { address, tokenId } = payload;
        const data = await getYourSharedCreationInfoHelper(address, tokenId);
        dispatch.nft.setEmailSharedList(data);
      } catch (err: any) {
        console.log(err.message);
      } finally {
        // dispatch.nft.setLoading(false);
      }
    },
  }),
});
