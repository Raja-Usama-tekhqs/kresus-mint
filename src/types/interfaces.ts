export interface IUser {
  email: string;
  isMfaEnabled: boolean;
  issuer: string | null;
  phoneNumber: null | string;
  publicAddress: string;
  recoveryFactors: any[];
  is_white_listed?: boolean;
  is_subscription?: boolean;
  is_verified?: boolean;
}

export interface INft {
  constract: {
    address: string;
    contractDeployer: string;
    deployedBlockNumber: number;
    isSpam: undefined | boolean;
    name: string;
    symbol: string;
    tokenType: string;
  };
  image: {
    cachedUrl: string;
    contentType: undefined | string;
    originalUrl: string;
    pngUrl: undefined | string;
    size: undefined | any;
    thumbnailUrl: undefined | string;
  };
  name: string;
  description: string;
  timeLastUpdated: string;
  tokenId: string;
  tokenType: string;
  tokenUri: string;
}

export interface INftResponse {
  balance: number;
  contractAddress: string;
  nftDetails: INft[];
  nftsImages: string[];
  timeLastUpdated: string;
  tokenType: string;
}
