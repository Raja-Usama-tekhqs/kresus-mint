require('dotenv').config();
const { PinataSDK } = require('pinata');

const JWT = process.env.NEXT_PUBLIC_IPFS_API_KEY;
const pinataServer = process.env.NEXT_PUBLIC_PINATA_SERVER;
const vercelLink = process.env.NEXT_PUBLIC_VERCEL_LINK;
const pinata = new PinataSDK({
  pinataJwt: JWT,
  pinataGateway: pinataServer,
});

export default async function pinDataToIPFS(file) {
  try {
    const uploadNFT = await pinata.upload.url(file);
    console.log('uploadNFT: ', uploadNFT);

    const uploadNFTMetaData = await pinata.upload.json({
      name: 'Marble',
      description: 'Digital Marble Art created with  Kresus Mini App',
      image: 'ipfs://' + uploadNFT.IpfsHash,
      external_url: vercelLink,
    });
    console.log('uploadNFTMetaData: ', uploadNFTMetaData);

    return uploadNFTMetaData.IpfsHash;
  } catch (error) {
    console.log(error);
  }
}
