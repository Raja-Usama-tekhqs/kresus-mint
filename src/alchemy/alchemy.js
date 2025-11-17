require('dotenv').config();
// Import necessary modules
const { Alchemy, Network } = require('alchemy-sdk');
const moment = require('moment-timezone');

// Configure Alchemy SDK with API key and network
const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
  // Network.BASE_SEPOLIA for testnet
};
const alchemy = new Alchemy(config);

export const formatDateWithTimezone = dateString => {
  const date = moment(dateString).tz('America/New_York'); // EST timezone
  return `${date.format('MMMM D, YYYY @h:mm:ss.SSS')} EST`;
};

function splitdata(data) {
  var temp = data?.split('ipfs.io/');
  if (temp?.length) {
    return temp[1];
  } else {
    ('');
  }
}

//fetch and print NFTs for a specific owner.
export const getNFTForOwnerHelper = async vaultAddress => {
  // Provided below is a sample address
  // Configure accordingly
  const address = vaultAddress;

  const nfts = await alchemy.nft.getNftsForOwner(address, {
    contractAddresses: [process.env.NEXT_PUBLIC_NFT_CONTRACT_HASH],
    pageSize: 100,
  });

  console.log('nfts: ', nfts);

  if (nfts.ownedNfts.length === 0) {
    return {
      nftsImages: [],
      timeLastUpdated: [],
      contractAddress: [],
      tokenType: [],
      balance: nfts.ownedNfts.length,
    };
  }

  let nftsImages = [],
    timeLastUpdated = null,
    contractAddress = null,
    tokenType = null;
  nfts.ownedNfts.forEach(nft => {
    let url = splitdata(nft.image.originalUrl);
    nftsImages.push(
      'https://' + process.env.NEXT_PUBLIC_PINATA_SERVER + '/' + url
    );
  });
  console.log('nfts: ', nfts.ownedNfts);
  if (nfts.ownedNfts.length > 0) {
    timeLastUpdated = nfts.ownedNfts[nfts.ownedNfts.length - 1].timeLastUpdated;
    timeLastUpdated = formatDateWithTimezone(timeLastUpdated);
    contractAddress =
      nfts.ownedNfts[nfts.ownedNfts.length - 1].contract.address;
    tokenType = nfts.ownedNfts[nfts.ownedNfts.length - 1].tokenType;
  }
  if (localStorage.getItem('nft-Id')) {
    localStorage.removeItem('nft-Id');
  }
  localStorage.setItem(
    'nft-Id',
    nfts.ownedNfts[nfts.ownedNfts.length - 1].tokenId
  );

  if (localStorage.getItem('nft-name')) {
    localStorage.removeItem('nft-name');
  }
  localStorage.setItem(
    'nft-name',
    nfts.ownedNfts[nfts.ownedNfts.length - 1].name
  );

  if (localStorage.getItem('nft-description')) {
    localStorage.removeItem('nft-description');
  }
  localStorage.setItem(
    'nft-description',
    nfts.ownedNfts[nfts.ownedNfts.length - 1].description
  );

  if (localStorage.getItem('nft-url')) {
    localStorage.removeItem('nft-url');
  }
  localStorage.setItem('nft-url', nftsImages[nftsImages.length - 1]);

  nftsImages = nftsImages.reverse();
  return {
    nftsImages,
    timeLastUpdated,
    contractAddress,
    tokenType,
    balance: nfts.ownedNfts.length,
    nftDetails: nfts.ownedNfts,
  };
};
// getNFTForOwnerHelper("0xee6E5a6ADFDC2df24536eB16022d126e2e81e157");
