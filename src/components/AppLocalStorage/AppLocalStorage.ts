
export const getKresusImage = () => {

    return localStorage.getItem("image-kresus") || null;
}

export const getKresusIndex = () => {
       return localStorage.getItem("index-kresus") || null;
}

export const getKresusFinal = () => {
    return localStorage.getItem("final-kresus") || null;
}

export const getVaultAddress = () => {
    return localStorage.getItem("vault_address") || null;
}
export const getToken = () => {
    return localStorage.getItem("token") || null;
}

export const getJWTToken = () => {
    return localStorage.getItem("jwt_token") || null;
}

export const getKresusGradient = () => {
       return localStorage.getItem("gradient-kresus") || null;
}

export const getIPFSHASH = () => {
    return localStorage.getItem("IPFS-Hash") || null;
}

export const getTxCost = () => {
    return localStorage.getItem("Tx-Cost") || null;
}


export const getNonce = () => {
    return localStorage.getItem("nonce") || null;
}

export const setJWTToken = (data: string) => {
    if (localStorage.getItem("jwt_token")) {
    localStorage.removeItem("jwt_token");
    }
    localStorage.setItem('jwt_token', data);
}  

export const setIPFSHASH = (data: string) => {
    if (localStorage.getItem("IPFS-Hash")) {
    localStorage.removeItem("IPFS-Hash");
    }
    localStorage.setItem('IPFS-Hash', data);
}  

export const setTxCost = (data: string) => {
    if (localStorage.getItem("Tx-Cost")) {
    localStorage.removeItem("Tx-Cost");
    }
    localStorage.setItem('Tx-Cost', data);
} 

export const setNonce = (data: string) => {
    if (localStorage.getItem("nonce")) {
    localStorage.removeItem("nonce");
    }
    localStorage.setItem('nonce', data);
} 
export const setKresusImage = (data: string) => {
    if (localStorage.getItem("image-kresus")) {
        localStorage.removeItem("image-kresus");
    }
    localStorage.setItem('image-kresus', data)
}

export const setKresusFinal = (data: string) => {
    if (localStorage.getItem("final-kresus")) {
        localStorage.removeItem("final-kresus");
    }
    localStorage.setItem('final-kresus', data)
}

export const setKresusGradient = (data: string) => {
    if (localStorage.getItem("gradient-kresus")) {
        localStorage.removeItem("gradient-kresus");
    }
    localStorage.setItem('gradient-kresus', data)
}

export const setKresusIndex = (data: string) => {
    if (localStorage.getItem("index-kresus")) {
        localStorage.removeItem("index-kresus");
    }
    localStorage.setItem('index-kresus', data)
}

export type LoginMethod = 'EMAIL' | 'SMS' | 'SOCIAL' | 'FORM';

export const saveUserInfo = (token: string, loginMethod: LoginMethod, userAddress: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('isAuthLoading', 'false');
    localStorage.setItem('loginMethod', loginMethod);
    // localStorage.setItem('user', userAddress);
};
