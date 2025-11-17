require('dotenv').config();
import axios from 'axios';
const {
  setJWTToken,
  getJWTToken,
} = require('../../components/AppLocalStorage/AppLocalStorage');

export const gasPriceHelper = async (vaultAddress, ipfsHash) => {
  try {
    const JWT = getJWTToken();
    const headers = { Authorization: 'Bearer ' + JWT };
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url:
        process.env.NEXT_PUBLIC_BACKEND +
        'getMintGasPrice/' +
        vaultAddress +
        '/' +
        ipfsHash,
      headers: headers,
    };

    const response = await axios.request(config);
    console.log(JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

export const convertEthIntoUSDHelper = async (
  symbolforconversion,
  symboltoconvertto,
  amount
) => {
  try {
    const JWT = getJWTToken();
    const headers = { Authorization: 'Bearer ' + JWT };
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url:
        process.env.NEXT_PUBLIC_BACKEND +
        'getPriceConversion/' +
        symbolforconversion +
        '/' +
        symboltoconvertto +
        '/' +
        amount,
      headers: headers,
    };

    const response = await axios.request(config);
    console.log(JSON.stringify(response.data));
    return response.data.conversion;
  } catch (error) {
    console.error('Error:', error);
  }
};

// {token, vaultAddress}

export const onboardingHelper = async payload => {
  try {
    let data = JSON.stringify(payload);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: process.env.NEXT_PUBLIC_BACKEND + 'onboarding',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    console.log(JSON.stringify(response.data));
    setJWTToken(response.data.access_token);
  } catch (error) {
    console.error('Error:', error);
  }
};

// export const mintNFTHelper = async (
//   IPFSMetaDataHash,
//   vaultAddress,
//   params,
//   giveAwayEntrySelected,
//   WLDAddress
// ) => {
//   try {
//     const JWT = getJWTToken();
//     const headers = {
//       'Content-Type': 'application/json',
//       Authorization: 'Bearer ' + JWT,
//     };
//     let data = JSON.stringify({
//       ipfsHash: IPFSMetaDataHash,
//       vaultAddress: vaultAddress,
//       giveAwayEntrySelected,
//       WLDAddress,
//       params: {
//         signerAddress: params.signerAddress,
//         vaultAddress: params.vaultAddress,
//         ipfsHash: params.ipfsHash,
//         signature: params.signature,
//       },
//     });

//     let config = {
//       method: 'post',
//       maxBodyLength: Infinity,
//       url: process.env.NEXT_PUBLIC_BACKEND + 'mintNFT',
//       headers: headers,
//       data: data,
//       timeout: 180000,
//     };

//     const response = await axios.request(config);
//     console.log(JSON.stringify(response.data));
//     return response.data;
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };

export const mintNFTHelper = async (
  IPFSMetaDataHash,
  vaultAddress,
  params,
  giveAwayEntrySelected,
  WLDAddress
) => {
  try {
    const JWT = getJWTToken();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + JWT,
    };

    const data = {
      ipfsHash: IPFSMetaDataHash,
      vaultAddress,
      giveAwayEntrySelected,
      WLDAddress,
      params: {
        signerAddress: params.signerAddress,
        vaultAddress: params.vaultAddress,
        ipfsHash: params.ipfsHash,
        signature: params.signature,
      },
    };

    const response = await axios.post('/api/mintNFT', data, { headers });
    return response.data;
  } catch (error) {
    console.error('Frontend Proxy Error:', error);
  }
};


export const shareYourCreationHelper = async (
  emails,
  vaultAddress,
  nftId,
  name,
  description,
  nftURL,
  ipfsHash
) => {
  try {
    const JWT = getJWTToken();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + JWT,
    };
    let data = JSON.stringify({
      emails: emails,
      vaultAddress: vaultAddress,
      nftId: nftId,
      name: name,
      description: description,
      nftURL: nftURL,
      ipfsHash: ipfsHash,
    });

    let config = {
      method: 'patch',
      maxBodyLength: Infinity,
      url: process.env.NEXT_PUBLIC_BACKEND + 'shareYourCreation/',
      headers: headers,
      data: data,
    };

    const response = await axios.request(config);
    console.log(JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

export const getYourSharedCreationInfoHelper = async (vaultAddress, nftId) => {
  try {
    const JWT = getJWTToken();
    const headers = { Authorization: 'Bearer ' + JWT };
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url:
        process.env.NEXT_PUBLIC_BACKEND +
        'getYourSharedCreationInfo/' +
        vaultAddress +
        '/' +
        nftId,
      headers: headers,
    };

    const response = await axios.request(config);
    console.log(JSON.stringify(response.data));
    return response.data.sharedNFTEmails;
  } catch (error) {
    console.error('Error:', error);
  }
};

export const getUserWhiteListStatusHelper = async () => {
  try {
    const JWT = getJWTToken();
    const headers = { Authorization: 'Bearer ' + JWT };
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: process.env.NEXT_PUBLIC_BACKEND + 'getUserWhiteListStatus/',
      headers: headers,
    };

    const response = await axios.request(config);
    console.log(JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

export const getCurrentUser = () => {
  try {
    const token = getJWTToken();
    const headers = { Authorization: 'Bearer ' + token };
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: process.env.NEXT_PUBLIC_BACKEND,
      headers: headers,
    };
    return axios.request(config);
  } catch (err) {
    return err;
  }
};

export const getClaimInfo = () => {
  const token = getJWTToken();
  const headers = { Authorization: 'Bearer ' + token };
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: process.env.NEXT_PUBLIC_BACKEND + 'checkSubscriptionForClaimFunds',
    headers: headers,
  };
  return axios.request(config);
};

export const handleMintSubscription = () => {
  const token = getJWTToken();
  const headers = { Authorization: 'Bearer ' + token };
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: process.env.NEXT_PUBLIC_BACKEND + 'handleMintSubscription',
    headers: headers,
  };
  return axios.request(config);
};
