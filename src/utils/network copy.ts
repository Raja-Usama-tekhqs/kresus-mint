import { base, mainnet, polygon, polygonMumbai, sepolia, baseSepolia } from '@alchemy/aa-core';
import { ChainId } from '@kresuslabs/core';

export enum Network {
  POLYGON_AMOY = 'polygon-amoy',
  POLYGON = 'polygon',
  ETHEREUM_SEPOLIA = 'ethereum-sepolia',
  ETHEREUM = 'ethereum',
  BASE = 'base',
  BASE_SEPOLIA = 'base-sepolia',
}

export const getAlchemyKey = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON:
      return 'fYFybLQFR9Zr2GCRcgALmAktStFKr0i0';
    case Network.POLYGON_AMOY:
      return 'fYFybLQFR9Zr2GCRcgALmAktStFKr0i0';
    case Network.ETHEREUM_SEPOLIA:
      return 'fYFybLQFR9Zr2GCRcgALmAktStFKr0i0';
    case Network.ETHEREUM:
      return 'fYFybLQFR9Zr2GCRcgALmAktStFKr0i0';
    case Network.BASE:
      return 'h9RWCx3Aq_mCeuDth1kGZB3MJixkoQhC';
    case Network.BASE_SEPOLIA:
      return 'vZAWutYyoAd6OQecs9aJpdqHxImLVkSg';
    default:
      throw new Error('Network not supported');
  }
};

export const getNetworkUrl = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON:
      return 'https://polygon-rpc.com/';
    case Network.POLYGON_AMOY:
      return 'https://rpc-amoy.polygon.technology/';
    case Network.ETHEREUM_SEPOLIA:
      return 'https://eth-sepolia.g.alchemy.com/v2/fYFybLQFR9Zr2GCRcgALmAktStFKr0i0';
    case Network.ETHEREUM:
      return 'https://eth-mainnet.g.alchemy.com/v2/fYFybLQFR9Zr2GCRcgALmAktStFKr0i0';
    case Network.BASE:
      return 'https://base-mainnet.g.alchemy.com/v2/h9RWCx3Aq_mCeuDth1kGZB3MJixkoQhC';
    case Network.BASE_SEPOLIA:
      return 'https://base-sepolia.g.alchemy.com/v2/vZAWutYyoAd6OQecs9aJpdqHxImLVkSg';
    case Network.ETHEREUM_SEPOLIA:
      return 'https://eth-sepolia.g.alchemy.com/v2/zSZISBz8_4Z4eGLV8_09TQnSQmeEdVeG';
    default:
      throw new Error('Network not supported');
  }
};

export const getChainId = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON:
      return 137;
    case Network.POLYGON_AMOY:
      return 80002;
    case Network.ETHEREUM_SEPOLIA:
      return 11155111;
    case Network.ETHEREUM:
      return 1;
    case Network.BASE:
      return 8453;
    case Network.BASE_SEPOLIA:
      return 84532;
    case Network.ETHEREUM_SEPOLIA:
      return ChainId.ETH_SEPOLIA;
    default:
      throw new Error('Chain not supported');
  }
};

export const getChain = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON:
      return polygon;
    case Network.POLYGON_AMOY:
      return polygonMumbai; // TODO: Update this to the correct chain
    case Network.ETHEREUM_SEPOLIA:
      return sepolia;
    case Network.ETHEREUM:
      return mainnet;
    case Network.BASE:
      return base;
    case Network.BASE_SEPOLIA:
      return baseSepolia;
    default:
      throw new Error('Chain not supported');
  }
};

export const getNetworkToken = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON_AMOY:
    case Network.POLYGON:
      return 'MATIC';
    case Network.ETHEREUM:
    case Network.ETHEREUM_SEPOLIA:
    case Network.BASE:
    case Network.BASE_SEPOLIA:
      return 'ETH';
  }
};

export const getFaucetUrl = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON_AMOY:
      return 'https://faucet.polygon.technology/';
    case Network.ETHEREUM_SEPOLIA:
      return 'https://sepoliafaucet.com/';
  }
};

export const getNetworkName = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON:
      return 'Polygon (Mainnet)';
    case Network.POLYGON_AMOY:
      return 'Polygon (Amoy)';
    case Network.ETHEREUM_SEPOLIA:
      return 'Ethereum (Sepolia)';
    case Network.ETHEREUM:
      return 'Ethereum (Mainnet)';
    case Network.BASE:
      return 'Base (Mainnet)';
    case Network.BASE_SEPOLIA:
      return 'Base (Sepolia)';
    default:
      throw new Error('Network not supported');
  }
};

export const getBlockExplorer = (address: string) => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON:
      return `https://polygonscan.com/address/${address}`;
    case Network.POLYGON_AMOY:
      return `https://www.oklink.com/amoy/address/${address}`;
    case Network.ETHEREUM:
      return `https://etherscan.io/address/${address}`;
    case Network.ETHEREUM_SEPOLIA:
      return `https://sepolia.etherscan.io/address/${address}`;
    case Network.BASE:
      return `https://basescan.org/address/${address}`;
    case Network.ETHEREUM_SEPOLIA:
      return `https://sepolia.basescan.org/address/${address}`;
    default:
      throw new Error('Network not supported');
  }
};
